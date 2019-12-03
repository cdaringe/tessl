import React from 'react'
import { BasePath } from './BasePath'
import { WithOnStateChange, WithSvg } from './interfaces'

const fiver = [0, 0, 0, 0, 0]

export function PathSetSymSemiEdgesHex ({
  length,
  onStateChange,
  svg
}: {
  length: number
} & WithSvg &
  WithOnStateChange) {
  const hexTranslator = `translate(${length} 0) rotate(-60 ${-length / 2} 0) `
  return (
    <>
      <g id='g1'>
        <BasePath
          {...{
            id: 'node1',
            initialPoints: [[-(length / 2), 0], [0, 0]],
            svg,
            stroke: 'black',
            fill: 'none',
            onStateChange
          }}
        />
        <use
          {...{
            href: '#node1',
            stroke: 'black',
            fill: 'none',
            transform: 'rotate(180 0 0)'
          }}
        />
      </g>
      {fiver.map((_, i) => {
        const id = `node${2 + i}`
        return (
          <use
            key={id}
            {...{
              id,
              href: '#g1',
              transform: hexTranslator.repeat(i + 1)
            }}
          />
        )
      })}
    </>
  )
}
