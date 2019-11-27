import { appendCircle } from '../src/path-edit'
import { D3SVG, Point } from '../src/interfaces'
import * as pm from '../src/point-maths'
import d3 = require('d3')
import test = require('blue-tape')

function createTestSvg () {
  return d3.select(d3
    .select('body')
    .append('svg')
    .attr('width', 200)
    .attr('height', 200)
    .node()! as SVGSVGElement)
}

function appendTestPathToSvg (svg$: D3SVG, points: Point[]) {
  return svg$
    .append('path')
    .attr('d', d3.line()(points)!)
    .attr('stroke', 'black')
    .attr('fill', 'none')
}

const paintNewOldNodes = (svg$: D3SVG, old: Point[], nw: Point[]) => {
  old.forEach(([x, y]) => appendCircle({ node$: svg$, x, y }))
  nw.forEach(([x, y]) =>
    appendCircle({ node$: svg$, x, y, r: 2 }).attr('fill', 'red')
  )
}

test('insertPointBetweenBounds - base case: simple line', t => {
  const points: Point[] = [[0, 0], [100, 100]]
  const svg$ = createTestSvg()
  const path$ = appendTestPathToSvg(svg$, points)
  const nextPoints = pm.insertPointBetweenBounds({
    selectedPoint: [75, 75],
    pathPoints: points,
    pathNode: path$.node()!,
    initialPathLength: 106
  })
  t.deepEqual(nextPoints, [[0, 0], [75, 75], [100, 100]])
  t.end()
})

test('insertPointBetweenBounds - base case: simple multipoint line', t => {
  const points: Point[] = [[0, 0], [25, 25], [50, 50], [100, 100]]
  const svg$ = createTestSvg()
  const path$ = appendTestPathToSvg(svg$, points)
  const nextPoints = pm.insertPointBetweenBounds({
    selectedPoint: [75, 75],
    pathPoints: points,
    pathNode: path$.node()!,
    initialPathLength: 106
  })
  t.deepEqual(nextPoints, [[0, 0], [25, 25], [50, 50], [75, 75], [100, 100]])
  t.end()
})

test('insertPointBetweenBounds - case: simple multipoint line', t => {
  const points: Point[] = [[0, 0], [25, 25], [50, 50], [100, 100]]
  const svg$ = createTestSvg()
  const path$ = appendTestPathToSvg(svg$, points)
  const nextPoints = pm.insertPointBetweenBounds({
    selectedPoint: [75, 75],
    pathPoints: points,
    pathNode: path$.node()!,
    initialPathLength: 106
  })
  paintNewOldNodes(svg$, points, nextPoints)
  t.deepEqual(nextPoints, [[0, 0], [25, 25], [50, 50], [75, 75], [100, 100]])
  t.end()
})

test('insertPointBetweenBounds - case: simple multipoint line', t => {
  const points: Point[] = [
    [0, 0],
    [0, 100],
    [10, 100],
    [10, 0],
    [20, 0],
    [20, 100]
  ]
  const svg$ = createTestSvg()
  const path$ = appendTestPathToSvg(svg$, points)
  const nextPoints = pm.insertPointBetweenBounds({
    selectedPoint: [5, 100],
    pathPoints: points,
    pathNode: path$.node()!,
    initialPathLength: 105
  })
  paintNewOldNodes(svg$, points, nextPoints)
  t.deepEqual(nextPoints, [
    [0, 0],
    [0, 100],
    [5, 100],
    [10, 100],
    [10, 0],
    [20, 0],
    [20, 100]
  ])
  t.end()
})
