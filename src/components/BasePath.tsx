import React from 'react'
import { fromPoints, Point, OnStateChange } from '@dino-dna/d3-svg-path-editor'
import { WithSvg } from './interfaces'
import d3 = require('d3')

type Props = {
  initialPoints: Point[]
  onStateChange?: OnStateChange
} & React.SVGProps<SVGPathElement> &
  WithSvg & { forwardedRef: any }

type State = {
  isPathLoaded: boolean
}
class BasePathBase extends React.PureComponent<Props, State> {
  constructor (props: Props) {
    super(props)
    this.state = { isPathLoaded: false }
  }

  componentDidUpdate () {
    const { forwardedRef, initialPoints, onStateChange, svg } = this.props
    if (!svg || this.state.isPathLoaded) return
    this.setState({ isPathLoaded: true })
    const pathEditor = fromPoints({
      testCanEditNode: (_, i) =>
        !(i === 0 || i === pathEditor.nodes.length - 1),
      onStateChange,
      points: initialPoints,
      svg$: d3.select(svg),
      path$: d3.select(forwardedRef.current),
      transformLine: line => {
        return (window as any).__LINE_MODE_CURVY__
          ? line.curve(d3.curveCatmullRom.alpha(0.9))
          : line
      }
    })
    ;(window as any)._pathEditor = pathEditor
  }

  render () {
    const {
      initialPoints: _,
      onStateChange: __,
      svg: ___,
      forwardedRef,
      ...rest
    } = this.props
    return <path ref={forwardedRef} {...rest} />
  }
}

export const BasePath = React.forwardRef(
  (props: Omit<Props, 'forwardedRef'>, ref) => (
    <BasePathBase {...(props as any)} forwardedRef={ref} />
  )
)
