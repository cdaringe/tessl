import './demo.css'
import { appendPath } from './path-edit'
import { Point } from './interfaces'
import { onStateChange } from './demo/on-state-change'
import { bindKeyEvents } from './demo/handle-key-events'
import d3 = require('d3')

const points: Point[] = [
  [10, 80],
  [100, 100],
  [200, 30],
  [300, 50],
  [400, 40],
  [500, 80]
]
const height = 600
const width = 800

const svg$ = d3
  .select((document.getElementById('demo') as unknown) as SVGSVGElement)
  .attr('width', width)
  .attr('height', height)

let undoEditNode: null | (() => void) = null

const path$ = appendPath({
  canEditPoint: (state, _, i) => {
    return !(i === 0 || state.metaPoints.length - 1 == i)
  },
  onStateChange: state => {
    // onStateChange(state)
  },
  bindUndo: dispatchUndo => {
    undoEditNode = dispatchUndo
  },
  points,
  svg$
})

bindKeyEvents({
  onUndo: () => undoEditNode!()
})
