import React from 'react'
import { PathSetSimpleHex } from './PathSetSimpleHex'
import { PathSetSymSemiEdgesHex } from './PathSetSymSemiEdgesHex'
import { Point, OnStateChange } from 'd3-svg-path-editor'

type Props = {}
type State = {
  ok: boolean
  points: Point[]
}

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
      ok: false,
      points: []
    }
    const fromQuery: Partial<State> = decodeURIComponent(
      window.location.search.replace(/^\?/, '')
    )
      .split('&')
      .reduce(
        (acc, [key, value]) => {
          if (key === 'points') {
            acc.points = value
              .split(',')
              .reduce((acc, curr) => {}, [] as Point[])
          }
          acc[key] = value
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
    return (
      '?' +
      ['points', encodeURIComponent(this.state.points.join(','))].join('=')
    )
  }

  onNextPoints: OnStateChange = metaPoints => {
    const points = metaPoints.map(mp => mp.point.map(i => i.toFixed(2)))
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
  }

  render () {
    const length = 100
    const { onNextPoints } = this
    return (
      <svg ref={this.svgNode} viewBox='-300 -300 600 600'>
        {/* <PathSetSimpleHex {...{ svg: this.svgNode.current!, length }} /> */}
        <PathSetSymSemiEdgesHex
          {...{
            svg: this.svgNode.current!,
            length,
            onStateChange: onNextPoints
          }}
        />
      </svg>
    )
  }
}
