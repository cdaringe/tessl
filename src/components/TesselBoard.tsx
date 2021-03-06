import React from 'react'
import { PathSetSymSemiEdgesHex } from './PathSetSymSemiEdgesHex'
import { Point, OnStateChange, MetaNode } from '@dino-dna/d3-svg-path-editor'
import debounce from 'lodash/debounce'
import { DisplayConfig, SidecarProps } from './interfaces'
import { RAD_THIRTY_DEG, RAD_SIXTY_DEG } from '../maths'
import { PathSetSimpleHex } from './PathSetSimpleHex'

type Props = {
  displayConfig: DisplayConfig
  isPurePathElements: boolean
  length: number
  onNodesChange: (nodes: MetaNode[]) => void
  points: Point[]
  renderNodeSideCar?: (opts: SidecarProps) => React.ReactElement<SVGElement>
}
type State = {
  ok: boolean
}

const isEven = (x: number) => x % 2 === 0

export class TesselBoard extends React.PureComponent<Props, State> {
  private svgNode: React.RefObject<any>
  constructor (props: Props) {
    super(props)
    this.svgNode = React.createRef()
    this.state = { ok: false }
  }

  componentDidMount () {
    // hack to force a re-render now that svgNode is set
    this.setState({ ok: true })
  }

  onNextPoints: OnStateChange = debounce(
    metaNodes => {
      this.props.onNodesChange(metaNodes)
    },
    50,
    { maxWait: 500 }
  )

  render () {
    const {
      onNextPoints,
      props: { displayConfig, isPurePathElements, length, points, renderNodeSideCar }
    } = this
    const yy = length / 2 / Math.tan(RAD_THIRTY_DEG)
    const xx = length + length * Math.cos(RAD_SIXTY_DEG)
    const height = 2 * yy
    return (
      <svg id='tesselboard' ref={this.svgNode} viewBox='-400 -400 800 800'>
        <g id='gg'>
          {/* <PathSetSimpleHex {...{ svg: this.svgNode.current!, length }} /> */}
          <PathSetSymSemiEdgesHex
            {...{
              uuid: 0,
              svg: this.svgNode.current!,
              length,
              onStateChange: onNextPoints,
              initialPoints: points,
              isPurePathElements
            }}
          />
        </g>
        {displayConfig.shapeCoordinates.map(([x, y], pointIndex) => {
          const yOffset = isEven(x) ? 0 : -yy
          let sidecar = null
          if (renderNodeSideCar) {
            sidecar = renderNodeSideCar({
              point: [x, y],
              pointIndex,
              cx: xx * x,
              cy: yOffset + height * y,
              key: `${x}${y}_c`
            })
          }
          return (
            <React.Fragment key={`${x}${y}`}>
              <use
                key={`${x}${y}_u`}
                href='#gg'
                transform={`translate(${xx * x}, ${yOffset + height * y})`}
              />
              {sidecar}
            </React.Fragment>
          )
        })}
      </svg>
    )
  }
}
