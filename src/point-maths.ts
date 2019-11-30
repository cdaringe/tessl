import { Point, State, Dispatch, D3SVG, MetaPoint } from './interfaces'
import d3 = require('d3')
import debounce from 'lodash/debounce'
import { toPointRef } from './path-edit'

function distance (p1: Point, p2: Point) {
  var dx = p2[0] - p1[0]
  var dy = p2[1] - p1[1]
  return Math.sqrt(dx * dx + dy * dy)
}

function distanceRectilinear (p1: Point, p2: Point) {
  var dx = p2[0] - p1[0]
  var dy = p2[1] - p1[1]
  return Math.abs(dx) + Math.abs(dy)
}

const isNear = (p1: Point, p2: Point, px: number = 1) =>
  distanceRectilinear(p1, p2) < px

/**
 * to insert point between p1 & p2
 * - get initial point
 * - find smallest allowable step
 *   - take that step
 *   - see if we have a point in range yet
 *   - if not, repeat
 *   - on success, assign, get remaining point
 */
export function insertPointBetweenBounds ({
  initialPathLength,
  pathNode,
  pathPoints,
  selectedPoint
}: {
  initialPathLength: number
  pathNode: SVGPathElement
  pathPoints: MetaPoint[]
  selectedPoint: Point
}): MetaPoint[] {
  if (!pathPoints.length || pathPoints.length < 2)
    throw new Error('not enough points')
  const derivedPoint = pathNode.getPointAtLength(initialPathLength)
  if (!isNear(selectedPoint, [derivedPoint.x, derivedPoint.y])) {
    throw new Error(
      [
        'initialPathLength does not produce initial point',
        `([${derivedPoint.x}, ${derivedPoint.y}]) equivalent`,
        `passed point (${selectedPoint.toString()})`
      ].join(' ')
    )
  }
  let currentLength = initialPathLength
  while (true) {
    const { x, y } = pathNode.getPointAtLength(currentLength)
    const distancesToPoint = pathPoints.map(mp => distance(mp.point, [x, y]))
    const minTravelToNextPoint = Math.min(...distancesToPoint)
    if (minTravelToNextPoint < 1) {
      const i = distancesToPoint.findIndex(d => d === minTravelToNextPoint)
      const nextPathPoints = [...pathPoints]
      const nexPoint: MetaPoint = {
        point: selectedPoint,
        ref: toPointRef(selectedPoint),
      }
      nextPathPoints.splice(i, 0, nexPoint)
      return nextPathPoints
    }
    currentLength += minTravelToNextPoint
  }
}

export function findClosest (pathNode: SVGPathElement, point: Point) {
  /* eslint-disable */
  const pathLength = pathNode.getTotalLength()
  let precision: number = 8
  let bestDistance: number = Infinity
  let best: DOMPoint = new DOMPoint(0, 0, 0, 0)
  let bestLength: number = 0

  // linear scan for coarse approximation
  for (
    var scan, scanLength = 0, scanDistance;
    scanLength <= pathLength;
    scanLength += precision
  ) {
    if (
      (scanDistance = distance2(
        (scan = pathNode.getPointAtLength(scanLength))
      )) < bestDistance
    ) {
      ;(best = scan), (bestLength = scanLength), (bestDistance = scanDistance)
    }
  }

  // binary search for precise estimate
  precision /= 2
  while (precision > 0.5) {
    var before, after, beforeLength, afterLength, beforeDistance, afterDistance
    if (
      (beforeLength = bestLength - precision) >= 0 &&
      (beforeDistance = distance2(
        (before = pathNode.getPointAtLength(beforeLength))
      )) < bestDistance
    ) {
      ;(best = before),
        (bestLength = beforeLength),
        (bestDistance = beforeDistance)
    } else if (
      (afterLength = bestLength + precision) <= pathLength &&
      (afterDistance = distance2(
        (after = pathNode.getPointAtLength(afterLength))
      )) < bestDistance
    ) {
      best = after
      bestLength = afterLength
      bestDistance = afterDistance
    } else {
      precision /= 2
    }
  }
  /* eslint-enable */
  return {
    pathLength: bestLength,
    distance: Math.sqrt(bestDistance),
    point: [best.x, best.y] as Point
  }

  function distance2 (p: DOMPoint) {
    var dx = p.x - point[0]
    var dy = p.y - point[1]
    return dx * dx + dy * dy
  }
}

/**
 * @todo
 * this mousehandler gets bound to the whole svg, and gets really slow when there's
 * a bunch of points.  we need to speed this mofo up. quadtree path trace perhaps?
 * but what resolution to add nodes to the tree?
 */
export function createMouseMoveHandler ({
  dispatch,
  path,
  snapperLine,
  snapperDot,
  state
}: {
  dispatch: Dispatch
  path: SVGPathElement
  snapperLine: d3.Selection<any, any, any, any>
  snapperDot: d3.Selection<SVGCircleElement, unknown, HTMLElement, any>
  state: State
}) {
  const setSnapperModeActive = (isNodeAddEnabled: boolean) => {
    if (state.isNodeAddEnabled === isNodeAddEnabled) return
    dispatch({
      type: isNodeAddEnabled ? 'EnableNodePlacement' : 'DisableNodePlacement'
    })
    snapperLine.style('opacity', isNodeAddEnabled ? 1 : 0)
    snapperDot.style('opacity', isNodeAddEnabled ? 1 : 0)
  }
  const updateSnapper = debounce(
    function updateSnapper (mousePoint: Point) {
      const { distance, point, pathLength: length } = findClosest(
        path,
        mousePoint
      )
      if (distance < 15 || distance > 100) return setSnapperModeActive(false)
      setSnapperModeActive(true)
      snapperLine
        .attr('x1', point[0])
        .attr('y1', point[1])
        .attr('x2', mousePoint[0])
        .attr('y2', mousePoint[1])
      snapperDot
        .attr('cx', point[0])
        .attr('cy', point[1])
        .lower()
      dispatch({
        type: 'SetNodePlacementCandidatePoint',
        value: { point, length }
      })
    },
    20,
    { maxWait: 30 }
  )
  return function onMouseMove (this: any) {
    const mousePoint: Point = d3.mouse(this)
    return updateSnapper(mousePoint)
  }
}
