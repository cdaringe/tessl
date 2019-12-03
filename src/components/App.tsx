import './App.css'
import { TesselBoard } from './TesselBoard'
import React, { PureComponent } from 'react'

export class App extends PureComponent {
  render () {
    return (
      <div>
        <TesselBoard />
        <p>wat</p>
      </div>
    )
  }
}
