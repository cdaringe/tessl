import { range } from 'd3'
import { DisplayConfig } from './components/interfaces'
import { Point } from '@dino-dna/d3-svg-path-editor'

const NUM_UNITS = 8
const NUM_UNITS_CENTER = Math.ceil(NUM_UNITS / 2)

const gridPoints = range(NUM_UNITS).reduce(
  (acc, x) => [
    ...acc,
    ...range(NUM_UNITS).map(
      y => [x - NUM_UNITS_CENTER, y - NUM_UNITS_CENTER] as Point
    )
  ],
  [] as Point[]
)

const gameboardPoints: Point[] = [
  ...(range(3).map(y => [-2, y - 1]) as Point[]),
  ...(range(4).map(y => [-1, y - 1]) as Point[]),
  ...(range(5)
    .map(y => (y - 2 === 0 ? null : [0, y - 2]))
    .filter(i => i) as Point[]),
  ...(range(4).map(y => [1, y - 1]) as Point[]),
  ...(range(3).map(y => [2, y - 1]) as Point[])
]
export const grid: DisplayConfig = {
  type: 'semilinehex',
  mode: 'grid',
  shapeCoordinates: gridPoints
}
export const gameboard: DisplayConfig = {
  type: 'semilinehex',
  mode: 'gameboard',
  shapeCoordinates: gameboardPoints
}
export const gameboardProduction: DisplayConfig = {
  type: 'semilinehex',
  mode: 'gameboard',
  shapeCoordinates: gameboardPoints
}

export const getShapeCoordinates = ({
  numColumns,
  numRows
}: {
  numColumns: number
  numRows: number
}) => range(numColumns).flatMap(x => range(numRows).map(y => [x, y]) as Point[])

export const TOKEN_VALUES = [
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12
]
