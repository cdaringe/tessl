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

export type CreateSnapperOpts = {
  dispatch: Dispatch
  path$: D3Path
  state: State
  svg$: D3SVG
}
export const createNodeSnapper = ({
  dispatch,
  path$,
  state,
  svg$
}: CreateSnapperOpts) => {
  svg$.on(
    'mousemove',
    createMouseMoveHandler({
      dispatch,
      path: path$.node()!,
      snapperDot: appendCircle({ x: -10, y: -10, node$: svg$ }),
      snapperLine: svg$.append('line'),
      state
    })
  )
  svg$.on('click', () => {
    if (!state.nodePlacementCandidate || !state.isNodeAddEnabled) return
    dispatch({ type: 'PromoteNodePlacementCandidatePoint' })
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
  pointIndex,
  pointCircle$,
  onDrag,
  onDragEnd,
  onDragStart
}: {
  pointIndex: number
  pointCircle$: D3Circle
  onDragStart: (pointIndex: number) => void
  onDrag: (opts: NodeMove) => void
  onDragEnd: (pointIndex: number) => void
}) => {
  ;(pointCircle$ as any).call(
    d3
      .drag()
      .on('start', d => {
        pointCircle$.attr('stroke', 'black')
        onDragStart(pointIndex)
      })
      .on('drag', d => {
        const { x, y } = d3.event
        onDrag({ pointIndex, x, y })
      })
      .on('end', d => {
        pointCircle$.attr('stroke', null)
        onDragEnd(pointIndex)
      })
  )
}

export const appendPath = ({
  bindUndo,
  canEditPoint,
  onStateChange,
  points,
  showNodes,
  svg$
}: CreateScene) => {
  const state: State = {
    history: [],
    isNodeAddEnabled: false,
    nodePlacementCandidate: null,
    path$: null,
    pointCircles: showNodes
      ? []
      : points.map(([x, y]) => appendCircle({ x, y, node$: svg$ })),
    points,
    svg$
  }
  const dispatch: Dispatch = msg => {
    const updateState: () => State = () => {
      console.log(msg.type)
      switch (msg.type) {
        case 'AppendCirclesToNodes': {
          if (showNodes) {
            state.pointCircles = state.points.map(([x, y]) =>
              appendCircle({ x, y, node$: state.svg$ })
            )
          }
          return state
        }
        case 'BindNodeDragHandlers': {
          state.points.forEach((point, i) => {
            if (canEditPoint) {
              if (!canEditPoint(state, point, i)) return
            }
            const pointCircle$ = state.pointCircles![i]
            createNodeDragger({
              pointCircle$,
              pointIndex: i,
              onDragStart: pointIndex => {
                state.draggedNodeStartPoint = [
                  points[pointIndex][0],
                  points[pointIndex][1]
                ]
              },
              onDrag: value => dispatch({ type: 'MoveNodePosition', value }),
              onDragEnd: pointIndex => {
                const currentPoint = state.points[pointIndex]
                const startPoint = state.draggedNodeStartPoint!
                delete state.draggedNodeStartPoint
                // dangerously swap old point value in just for a hot second,
                // as the drag operation has already updated our point array and
                // we want to update history reflecting the start point
                state.points[pointIndex] = startPoint
                dispatch({ type: 'UpdatePointHistory' })
                state.points[pointIndex] = currentPoint
                // phew! sorry.  that was gross.
              }
            })
            pointCircle$.on('mouseenter', () => {
              pointCircle$.attr('stroke', '#ccc').attr('stroke-width', 3)
              dispatch({ type: 'DisableNodePlacement' })
            })
            pointCircle$.on('mouseout', () => {
              pointCircle$.attr('stroke', null).attr('stroke-width', null)
            })
          })
          return state
        }
        case 'ClearCirclesFromNodes': {
          state.pointCircles &&
            state.pointCircles.forEach(circle$ => circle$.remove())
          return state
        }
        case 'CreateNodeSnapper': {
          if (!state.path$) return state
          if (state.nodeSnapperUnsubscribe) state.nodeSnapperUnsubscribe()
          state.nodeSnapperUnsubscribe = createNodeSnapper({
            dispatch,
            path$: state.path$,
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
            points: state.points,
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
          const movedPoint = state.points[pointIndex]
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
          state.points = insertPointBetweenBounds({
            pathNode: state.path$.node()!,
            pathPoints: state.points,
            selectedPoint: point,
            initialPathLength: length
          })
          dispatch({ type: 'RepaintNodeCircles' })
          return state
        }
        case 'UndoPointChange': {
          if (!state.history.length) return state
          state.points = JSON.parse(state.history.pop()!)
          dispatch({ type: 'RepaintAll' })
          return state
        }
        case 'UpdatePointHistory': {
          state.history.push(JSON.stringify(state.points))
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
          dispatch({ type: 'AppendCirclesToNodes' })
          dispatch({ type: 'BindNodeDragHandlers' })
          return state
        }
        case 'SetNodePlacementCandidatePoint': {
          state.nodePlacementCandidate = msg.value
          return state
        }
      }
      return state
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
