import { SidecarProps } from './interfaces'
import React from 'react'

export const PointCircle = ({
  cx,
  cy,
  children,
  ...rest
}: React.SVGAttributes<any> & SidecarProps) => {
  return (
    <g transform={`translate(${cx}, ${cy})`} {...rest}>
      <circle
        r='25'
        fill='none'
        style={{
          fill: 'none'
        }}
      />
      {children}
    </g>
  )
}
