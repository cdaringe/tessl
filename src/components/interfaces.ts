import { OnStateChange, Point } from '@dino-dna/d3-svg-path-editor'

export type WithOnStateChange = {
  onStateChange: OnStateChange
}
export type WithSvg = {
  svg: SVGSVGElement
}

export enum TESSELTYPE {
  'semilinehex' = 'semilinehex',
  'hex' = 'hex'
}
export enum DISPLAYMODE {
  'gameboard' = 'gameboard',
  'grid' = 'grid',
  'gameboardProduction' = 'gameboardProduction'
}

export type TesselType = keyof typeof TESSELTYPE
export type DisplayMode = keyof typeof DISPLAYMODE
export type DisplayConfig = {
  mode: DisplayMode
  type: TesselType
  shapeCoordinates: Point[]
}

export type SidecarProps = {
  cx: number
  cy: number
  key?: string
  point?: Point
  pointIndex?: number
}
