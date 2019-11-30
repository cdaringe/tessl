export type AppendCircleOptions = {
  x: number
  y: number
  r?: number
  node$: d3.Selection<any, any, any, any>
}

export type CreateScene = {
  onStateChange?: (state: State) => void
  points: Point[]
  svg$: D3SVG
  canEditPoint?: (state: State, point: Point, pointIndex: number) => boolean
  bindUndo?: (undo: () => void) => void
}

export type D3Path = d3.Selection<SVGPathElement, any, any, any>

export type D3SVG = d3.Selection<SVGSVGElement, unknown, null, undefined>

export type D3Circle = d3.Selection<SVGCircleElement, any, any, any>

export type Point = [number, number]

export type MetaPoint = {
  circle$?: D3Circle
  isDragHandlerBound?: boolean
  ref: string
  point: Point
}

export type State = {
  history: string[]
  isNodeAddEnabled: boolean
  nodePlacementCandidate: { point: Point; length: number } | null
  nodeSnapperUnsubscribe?: () => void
  draggedNodeStartPoint?: Point
  path$: D3Path | null
  metaPoints: MetaPoint[]
  svg$: D3SVG
}

export type NodeMove = { pointIndex: number; x: number; y: number }
export type Msg =
  | { type: 'AppendPointCircles' }
  | { type: 'BindNodeDragHandlers' }
  | { type: 'ClearCirclesFromNodes' }
  | { type: 'CreateNodeSnapper' }
  | { type: 'DisableNodePlacement' }
  | { type: 'DrawPath' }
  | { type: 'EnableNodePlacement' }
  | {
      type: 'MoveNodePosition'
      value: NodeMove
    }
  | { type: 'PromoteNodePlacementCandidatePoint' }
  | { type: 'RepaintNodeCircles' }
  | { type: 'RepaintAll' }
  | {
      type: 'SetNodePlacementCandidatePoint'
      value: State['nodePlacementCandidate']
    }
  | { type: 'UndoPointChange' }
  | { type: 'UpdatePointHistory' }
export type Dispatch = (msg: Msg) => State
