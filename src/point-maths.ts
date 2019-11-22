import { Point } from './interfaces'
import d3 = require('d3')

function distanceSquared (p1: Point, p2: Point) {
  var dx = p2[0] - p1[0]
  var dy = p2[1] - p1[1]
  return dx * dx + dy * dy
}
export function getBoundingPoints ({
  initialPathLength,
  pathPoints,
  pathNode,
  point
}: {
  pathPoints: Point[]
  initialPathLength: number
  pathNode: SVGPathElement
  point: Point
}): [Point, Point] {
  if (!pathPoints.length || pathPoints.length < 2) {
    throw new Error('not enough points')
  }
  const total = pathNode.getTotalLength()
  // check one-two
  const initialPointVerifier = pathNode.getPointAtLength(initialPathLength)
  if (
    point[0] !== initialPointVerifier.x ||
    point[1] !== initialPointVerifier.y
  ) {
    throw new Error(
      'initialPathLength does not produce initial point equivalent passed point'
    )
  }
  const distancesToPoint = pathPoints.map(pathPoint =>
    Math.sqrt(distanceSquared(pathPoint, point))
  )
  const minTravelToNextPoint = Math.min(...distancesToPoint)
  // while ()
  // pathNode.
  const p1: Point = [0, 0]
  const p2: Point = [0, 0]
  return [p1, p2]
}

export function findClosest (
  pathNode: SVGPathElement,
  point: [number, number]
) {
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
    pathLength,
    distance: Math.sqrt(bestDistance),
    point: [best.x, best.y]
  }

  function distance2 (p: DOMPoint) {
    var dx = p.x - point[0]
    var dy = p.y - point[1]
    return dx * dx + dy * dy
  }
}

export function createMouseMoveHandler ({
  path,
  snapperLine,
  snapperDot
}: {
  path: SVGPathElement
  snapperLine: d3.Selection<any, any, any, any>
  snapperDot: d3.Selection<SVGCircleElement, unknown, HTMLElement, any>
}) {
  let visible = false
  const setVisible = (nextVisible: boolean) => {
    if (nextVisible === visible) return
    visible = nextVisible
    snapperLine.style('opacity', nextVisible ? 1 : 0)
    snapperDot.style('opacity', nextVisible ? 1 : 0)
  }
  return function (this: any) {
    const m = d3.mouse(this)
    const { point, distance } = findClosest(path, m)
    if (distance > 100) return setVisible(false)
    setVisible(true)
    snapperLine
      .attr('x1', point[0])
      .attr('y1', point[1])
      .attr('x2', m[0])
      .attr('y2', m[1])
    snapperDot.attr('cx', point[0]).attr('cy', point[1])
  }
}
