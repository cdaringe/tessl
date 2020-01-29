import React from 'react'
import { BasePath } from './BasePath'
import { WithOnStateChange, WithSvg } from './interfaces'
import { Point } from '@dino-dna/d3-svg-path-editor'

const fiver = [0, 0, 0, 0, 0]

export type Props = {
  isPurePathElements: boolean
  uuid: number
  length: number
  initialPoints?: Point[]
} & WithSvg &
  WithOnStateChange

export const PathSetSymSemiEdgesHex = ({
  length,
  initialPoints,
  onStateChange,
  isPurePathElements,
  svg,
  uuid
}: Props) => {
  const hexTransformer = `translate(${length} 0) rotate(-60 ${-length / 2} 0) `
  const ref = React.useRef<SVGPathElement>(null)
  const [d, setPathD] = React.useState('')
  const groupId = `g${uuid}`
  const node1Id = `${groupId}_node1`
  const PathComponent = isPurePathElements ? 'path' : 'use'
  const pathProps = isPurePathElements ? { d } : { href: `#${node1Id}` }
  return (
    <>
      <g id={groupId}>
        <BasePath
          {...{
            ref,
            id: node1Id,
            initialPoints:
              initialPoints && initialPoints.length > 1
                ? initialPoints
                : [
                    [-(length / 2), 0],
                    [0, 0]
                  ],
            svg,
            stroke: 'black',
            fill: 'none',
            onStateChange: (...args) => {
              const nextD = ref.current ? ref.current!.getAttribute('d')! : ''
              setPathD(nextD)
              onStateChange(...args)
            }
          }}
        />
        <PathComponent
          {...{
            ...pathProps,
            stroke: 'black',
            fill: 'none',
            transform: 'rotate(180 0 0)'
          }}
        />
      </g>
      {fiver.map((_, i) => {
        const id = `node${2 + i}_${uuid}`
        return (
          <PathComponent
            key={id}
            {...{
              ...pathProps,
              id,
              transform: hexTransformer.repeat(i + 1)
            }}
          />
        )
      })}
    </>
  )
}
