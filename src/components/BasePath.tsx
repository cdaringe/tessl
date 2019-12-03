import React from 'react'
import { fromPoints, Point, OnStateChange } from 'd3-svg-path-editor'
import { WithSvg } from './interfaces'
import d3 = require('d3')

type Props = {
  initialPoints: Point[]
  onStateChange: OnStateChange
} & React.SVGProps<SVGPathElement> &
  WithSvg

type State = {
  isPathLoaded: boolean
}
export class BasePath extends React.PureComponent<Props, State> {
  private pathNode: React.RefObject<any>
  constructor (props: Props) {
    super(props)
    this.pathNode = React.createRef()
    this.state = { isPathLoaded: false }
  }

  componentDidUpdate () {
    const { initialPoints, onStateChange, svg } = this.props
    if (!svg || this.state.isPathLoaded) return
    this.setState({ isPathLoaded: true })
    const { nodes } = fromPoints({
      testCanEditNode: (_, i) => !(i === 0 || i === nodes.length - 1),
      onStateChange,
      points: initialPoints,
      svg$: d3.select(svg),
      path$: d3.select(this.pathNode.current)
    })
  }

  render () {
    const {
      initialPoints: _,
      onStateChange: __,
      svg: ___,
      ...rest
    } = this.props
    return <path ref={this.pathNode} {...rest} />
  }
}
