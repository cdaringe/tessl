export type AppendCircleOptions = {
  x: number
  y: number
  r?: number
  node$: d3.Selection<any, any, any, any>
}

export type CreateScene = {
  el: SVGElement
  height: number
  width: number
  points: Point[]
  showNodes?: boolean
}

export type D3Path = d3.Selection<SVGPathElement, any, any, any>

export type D3SVG = d3.Selection<SVGElement, unknown, null, undefined>

export type Point = [number, number]
