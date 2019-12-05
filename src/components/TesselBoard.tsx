import React from 'react'
import { PathSetSymSemiEdgesHex } from './PathSetSymSemiEdgesHex'
import { Point, OnStateChange } from 'd3-svg-path-editor'
import debounce from 'lodash/debounce'
import { range } from 'd3'
// import { PathSetSimpleHex } from './PathSetSimpleHex'

type Props = {}
type State = {
  ok: boolean
  points?: Point[]
}

const RAD_THIRTY_DEG = (Math.PI * 30) / 180
const RAD_SIXTY_DEG = RAD_THIRTY_DEG * 2
const NUM_UNITS = 8
const NUM_UNITS_CENTER = Math.ceil(NUM_UNITS / 2)

const isEven = (x: number) => x % 2 === 0

export class TesselBoard extends React.PureComponent<Props, State> {
  private svgNode: React.RefObject<any>
  constructor (props: Props) {
    super(props)
    this.svgNode = React.createRef()
    this.state = this.decodeQuery()
  }

  componentDidMount () {
    // hack to force a re-render now that svgNode is set
    this.setState({ ok: true })
  }

  decodeQuery: () => State = () => {
    const defaultState: State = {
      ok: false
    }
    const search = decodeURIComponent(window.location.search.replace(/^\?/, ''))
    const fromQuery: Partial<State> = search
      .split('&')
      .map(kv => kv.split('='))
      .reduce(
        (acc, [key, value]) => {
          if (key === 'points') {
            const pairs = value.split(';')
            if (pairs.length) {
              acc.points = pairs.reduce(
                (acc, cur) =>
                  acc.concat([cur.split(',').map(i => parseFloat(i)) as Point]),
                [] as Point[]
              )
            }
          }
          // acc[key] = value
          return acc
        },
        {} as Partial<State>
      )
    return {
      ...defaultState,
      ...fromQuery
    }
  }

  encodeQuery = () => {
    if (!this.state.points) return ''
    return (
      '?' +
      [
        'points',
        encodeURIComponent(
          this.state.points.map(pair => pair.join(',')).join(';')
        )
      ].join('=')
    )
  }

  onNextPoints: OnStateChange = debounce(
    metaPoints => {
      const points = metaPoints.map(mp =>
        mp.point.map(i => parseFloat(i.toFixed(2)))
      ) as Point[]
      this.setState({ points })
      if (history.pushState) {
        var newurl =
          window.location.protocol +
          '//' +
          window.location.host +
          window.location.pathname +
          this.encodeQuery()
        window.history.pushState({ path: newurl }, '', newurl)
      }
    },
    50,
    { maxWait: 500 }
  )

  render () {
    const length = 100
    const {
      onNextPoints,
      state: { points }
    } = this
    const yy = length / 2 / Math.tan(RAD_THIRTY_DEG)
    const height = 2 * yy
    const xx = length + length * Math.cos(RAD_SIXTY_DEG)
    return (
      <svg ref={this.svgNode} viewBox='-300 -300 600 600'>
        <g id='gg'>
          {/* <PathSetSimpleHex {...{ svg: this.svgNode.current!, length }} /> */}
          <PathSetSymSemiEdgesHex
            {...{
              svg: this.svgNode.current!,
              length,
              onStateChange: onNextPoints,
              initialPoints: points
            }}
          />
        </g>
        {range(NUM_UNITS).map(_x =>
          range(NUM_UNITS).map(_y => {
            const x = _x - NUM_UNITS_CENTER
            const y = _y - NUM_UNITS_CENTER
            const yOffset = isEven(x) ? 0 : yy
            return (
              <use
                key={`${x}${y}`}
                href='#gg'
                transform={`translate(${xx * x}, ${yOffset + height * y})`}
              />
            )
          })
        )}
        {/* <use href='#gg' transform={`translate(-150, ${yy})`} />
        <use href='#gg' transform={`translate(-150, ${-yy})`} />
        <use href='#gg' transform={`translate(150, ${yy})`} />
        <use href='#gg' transform={`translate(150, ${-yy})`} /> */}
      </svg>
    )
  }
}
