import './tessel.css'
import { createMouseMoveHandler } from './point-maths'
import {
  CreateScene,
  D3SVG,
  AppendCircleOptions,
  Point,
  D3Path
} from './interfaces'
import d3 = require('d3')

export type CreateSnapperOpts = { svg$: D3SVG; path$: D3Path }
export const createNodeSnapper = ({ path$, svg$ }: CreateSnapperOpts) =>
  svg$.on(
    'mousemove',
    createMouseMoveHandler({
      path: path$.node()!,
      snapperDot: appendCircle({ x: -10, y: -10, node$: svg$ }),
      snapperLine: svg$.append('line')
    })
  )

const appendCircle = ({ x, y, r, node$ }: AppendCircleOptions) =>
  node$
    .append('circle')
    .attr('cx', x)
    .attr('cy', y)
    .attr('r', r || 3.5)

export type AppendPathOptions = { points: Point[]; svg$: D3SVG }
export const appendPath = ({ points, svg$ }: AppendPathOptions) =>
  svg$
    .append('path')
    .attr('d', d3.line()(points)!)
    .attr('stroke', 'black')
    .attr('fill', 'none')

export const createSvg = (width: number, height: number): SVGElement =>
  d3
    .select('body')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .node()!

export const createScene = ({
  width,
  height,
  el,
  points,
  showNodes
}: CreateScene) => {
  if (!el) throw new Error('missing svg element')
  const svg$ = d3
    .select(el)
    .attr('width', width)
    .attr('height', height)
  showNodes && points.map(([x, y]) => appendCircle({ x, y, node$: svg$ }))
  const path$ = appendPath({ points, svg$ })
  createNodeSnapper({
    path$,
    svg$
  })
}

const points: Point[] = [
  [0, 80],
  [100, 100],
  [200, 30],
  [300, 50],
  [400, 40],
  [500, 80]
]
createScene({
  el: document.getElementById('demo')! as any,
  height: 600,
  points,
  showNodes: true,
  width: 800
})
