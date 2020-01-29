import React from 'react'
import { BasePath } from './BasePath'
import { WithSvg } from './interfaces'

const fiver = [' ', ' ', ' ', ' ', ' ']

export function PathSetSimpleHex ({
  length,
  svg
}: {
  length: number
} & WithSvg) {
  const hexTranslator = `translate(${length} 0) rotate(-60 ${-length / 2} 0) `
  return (
    <>
      <BasePath
        {...{
          id: 'node1',
          initialPoints: [
            [-(length / 2), 0],
            [length / 2, 0]
          ],
          svg,
          stroke: 'black',
          fill: 'none'
        }}
      />
      {fiver.map((_, i) => {
        const id = `node${2 + i}`
        return (
          <use
            key={id}
            {...{
              id,
              xlinkHref: '#node1',
              transform: hexTranslator.repeat(i + 1)
            }}
          />
        )
      })}
    </>
  )
}
