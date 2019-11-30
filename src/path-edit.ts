import { createMouseMoveHandler, insertPointBetweenBounds } from './point-maths'
import {
  AppendCircleOptions,
  CreateScene,
  D3Circle,
  D3Path,
  D3SVG,
  Dispatch,
  Point,
  State,
  NodeMove
} from './interfaces'
import d3 = require('d3')

export const toPointRef = ([x, y]: Point) => `${x.toFixed(3)}_${y.toFixed(3)}`

export type CreateSnapperOpts = {
  dispatch: Dispatch
  onAddNode: () => void
  getPath$: () => D3Path
  state: State
  svg$: D3SVG
}
export const createNodeSnapper = ({
  dispatch,
  onAddNode,
  getPath$,
  state,
  svg$
}: CreateSnapperOpts) => {
  svg$.on(
    'mousemove',
    createMouseMoveHandler({
      dispatch,
      path: getPath$().node()!,
      snapperDot: appendCircle({ x: -10, y: -10, node$: svg$ }),
      snapperLine: svg$.append('line'),
      state
    })
  )
  svg$.on('click', () => {
    if (!state.nodePlacementCandidate || !state.isNodeAddEnabled) return
    onAddNode()
  })
  return () => {
    svg$.on('click', null)
    svg$.on('mousemove', null)
  }
}

export const appendCircle = ({ x, y, r, node$ }: AppendCircleOptions) =>
  node$
    .append('circle')
    .attr('cx', x)
    .attr('cy', y)
    .attr('r', r || 10)

export type AppendPathOptions = { points: Point[]; svg$: D3SVG }
export const appendPathToSvg = ({ points, svg$ }: AppendPathOptions) =>
  svg$
    .append('path')
    .attr('d', d3.line().curve(d3.curveCatmullRom.alpha(0.5))(points)!)
    .attr('stroke', 'black')
    .attr('fill', 'none')

export const createSvg = (width: number, height: number): SVGElement =>
  d3
    .select('body')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .node()!

export const createNodeDragger = ({
  circle$,
  onDrag,
  onDragEnd,
  onDragStart,
  pointIndex,
}: {
  circle$: D3Circle
  onDrag: (opts: NodeMove) => void
  onDragEnd: (pointIndex: number) => void
  onDragStart: (pointIndex: number) => void
  pointIndex: number
}) => {
  ;(circle$ as any).call(
    d3
      .drag()
      .on('start', d => {
        circle$.attr('stroke', 'black')
        onDragStart(pointIndex)
      })
      .on('drag', d => {
        const { x, y } = d3.event
        onDrag({ pointIndex, x, y })
      })
      .on('end', d => {
        circle$.attr('stroke', null)
        onDragEnd(pointIndex)
      })
  )
}

export const appendPath = ({
  bindUndo,
  canEditPoint,
  onStateChange,
  points,
  svg$
}: CreateScene) => {
  const state: State = {
    history: [],
    isNodeAddEnabled: false,
    nodePlacementCandidate: null,
    path$: null,
    metaPoints: points.map(point => {
      const [ x, y ] = point
      return {
        circle$: appendCircle({ x, y, node$: svg$ }),
        point,
        ref: toPointRef(point)
      }
    }),
    svg$
  }
  const dispatch: Dispatch = msg => {
    const updateState: () => State = () => {
      console.log(msg.type)
      switch (msg.type) {
        case 'AppendPointCircles': {
          state.metaPoints.forEach(mp => {
            if (mp.circle$) return
            const [ x, y ] = mp.point
            mp.circle$ = appendCircle({ x, y, node$: state.svg$ })
          })
          return state
        }
        case 'BindNodeDragHandlers': {
          state.metaPoints.forEach((mp, i) => {
            const { circle$, isDragHandlerBound, point, ref } = mp
            if (isDragHandlerBound || !circle$) return
            if (canEditPoint && !canEditPoint(state, point, i)) return
            mp.isDragHandlerBound = true
            createNodeDragger({
              circle$,
              pointIndex: i,
              onDragStart: pointIndex =>
                (state.draggedNodeStartPoint = points[pointIndex]),
              onDrag: value => dispatch({ type: 'MoveNodePosition', value }),
              onDragEnd: pointIndex => {
                const metaPoint = state.metaPoints[pointIndex]
                const currentPoint = metaPoint.point
                const startPoint = state.draggedNodeStartPoint!
                delete state.draggedNodeStartPoint
                // dangerously swap old point value in just for a hot second,
                // as the drag operation has already updated our point array and
                // we want to update history reflecting the start point
                metaPoint.point = startPoint
                dispatch({ type: 'UpdatePointHistory' })
                metaPoint.point = currentPoint
                // phew! sorry.  that was gross.
              }
            })
            circle$.on('mouseenter', () => {
              circle$.attr('stroke', '#ccc').attr('stroke-width', 3)
              dispatch({ type: 'DisableNodePlacement' })
            })
            circle$.on('mouseout', () => {
              circle$.attr('stroke', null).attr('stroke-width', null)
            })
          })
          return state
        }
        case 'ClearCirclesFromNodes': {
          state.metaPoints.forEach(mp => {
            mp.circle$ && mp.circle$.remove()
            mp.isDragHandlerBound = false // @todo improve handler unsubscription
          })
          return state
        }
        case 'CreateNodeSnapper': {
          if (!state.path$) return state
          if (state.nodeSnapperUnsubscribe) return state
          state.nodeSnapperUnsubscribe = createNodeSnapper({
            dispatch,
            onAddNode: () =>
              dispatch({ type: 'PromoteNodePlacementCandidatePoint' }),
            getPath$: () => state.path$!,
            svg$: state.svg$,
            state
          })
          return state
        }
        case 'DisableNodePlacement': {
          state.isNodeAddEnabled = false
          state.nodePlacementCandidate = null
          return state
        }
        case 'DrawPath': {
          if (state.path$) state.path$.remove()
          state.path$ = appendPathToSvg({
            points: state.metaPoints.map(m => m.point),
            svg$: state.svg$
          })
          return state
        }
        case 'EnableNodePlacement': {
          state.isNodeAddEnabled = true
          return state
        }
        case 'MoveNodePosition': {
          const { pointIndex, x, y } = msg.value
          const movedPoint = state.metaPoints[pointIndex].point
          if (movedPoint) {
            movedPoint[0] = x
            movedPoint[1] = y
          }
          dispatch({ type: 'RepaintAll' })
          return state
        }
        case 'PromoteNodePlacementCandidatePoint': {
          if (!state.path$) return state
          dispatch({ type: 'UpdatePointHistory' })
          const { point, length } = state.nodePlacementCandidate!
          dispatch({ type: 'DisableNodePlacement' })
          state.metaPoints = insertPointBetweenBounds({
            pathNode: state.path$.node()!,
            pathPoints: state.metaPoints,
            selectedPoint: point,
            initialPathLength: length
          })
          dispatch({ type: 'RepaintNodeCircles' })
          return state
        }
        case 'UndoPointChange': {
          if (!state.history.length) return state
          state.metaPoints = JSON.parse(state.history.pop()!)
          dispatch({ type: 'RepaintAll' })
          return state
        }
        case 'UpdatePointHistory': {
          state.history.push(JSON.stringify(state.metaPoints))
          if (state.history.length > 25) state.history.shift()
          return state
        }
        case 'RepaintAll': {
          dispatch({ type: 'RepaintNodeCircles' })
          dispatch({ type: 'DrawPath' })
          dispatch({ type: 'CreateNodeSnapper' })
          return state
        }
        case 'RepaintNodeCircles': {
          dispatch({ type: 'ClearCirclesFromNodes' })
          dispatch({ type: 'AppendPointCircles' })
          dispatch({ type: 'BindNodeDragHandlers' })
          return state
        }
        case 'SetNodePlacementCandidatePoint': {
          state.nodePlacementCandidate = msg.value
          return state
        }
      }
    }
    const nextState = updateState()
    onStateChange && onStateChange(nextState)
    return nextState
  }
  dispatch({ type: 'DrawPath' })
  dispatch({ type: 'RepaintNodeCircles' })
  dispatch({ type: 'CreateNodeSnapper' })
  if (bindUndo) bindUndo(() => dispatch({ type: 'UndoPointChange' }))
  return state.path$!
}
