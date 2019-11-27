import './demo.css'
import { appendPath } from './path-edit'
import { Point } from './interfaces'
import { bindKeyEvents } from './demo/handle-key-events'
import d3 = require('d3')

const points: Point[] = [
  [350, 400],
  [450, 400],
]
const width = 800
const height = 600

const svg$ = d3
  .select((document.getElementById('demo') as unknown) as SVGSVGElement)
  .attr('width', width)
  .attr('height', height)

let undoEditNode: null | (() => void) = null

const path$ = appendPath({
  canEditPoint: (state, _, i) => {
    return !(i === 0 || state.points.length - 1 == i)
  },
  onStateChange: state => {
    if (!svg$.node() || !path$) return
    // svg$.node()!.appendChild(path$.clone().attr("transform", "rotate(35deg);").node()!)
  },
  bindUndo: dispatchUndo => {
    undoEditNode = dispatchUndo
  },
  points,
  showNodes: true,
  svg$
})

bindKeyEvents({
  onUndo: () => undoEditNode!()
})
