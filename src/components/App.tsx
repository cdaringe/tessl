import './App.css'
import { DisplayMode } from './interfaces'
import {
  grid,
  gameboard,
  gameboardProduction,
  getShapeCoordinates,
  TOKEN_VALUES
} from '../tessel-display-config'
import { MetaNode, Point } from '@dino-dna/d3-svg-path-editor'
import { TesselBoard } from './TesselBoard'
import * as Board from './Gameboard'
import React, { PureComponent } from 'react'
import { RAD_THIRTY_DEG } from '../maths'
import { ControlPanel } from './ControlPanel'
import { getPathEditor, toggleLineMode } from './hacks'

type State = {
  displayMode: DisplayMode
  edgeColor: string
  length: number
  metaNodes: MetaNode[]
  nodeSize: number
  numColumns: number
  numRows: number
  points: Point[]
  isCurvyLineMode: boolean
  showControls: boolean
  tokenNumberColor: string
  tokenStartOffset: number
}
export class App extends PureComponent<any, State> {
  constructor (props: any) {
    super(props)
    this.state = {
      displayMode: 'grid',
      edgeColor: 'black',
      isCurvyLineMode: false,
      length: 100,
      metaNodes: [],
      nodeSize: 1,
      numColumns: 3,
      numRows: 3,
      points: [],
      showControls: false,
      tokenNumberColor: 'red',
      tokenStartOffset: 0,
      ...this.decodeQuery()
    }
    setTimeout(() => this.paintEdges(), 5)
  }

  paintEdges = () => {
    const path$ = getPathEditor().path$
    path$.attr('stroke', this.state.edgeColor)
  }

  onToggleControls = () =>
    this.setState({ showControls: !this.state.showControls })

  updateNodeSizes = () => {
    const { nodeSize } = this.state
    this.state.metaNodes.forEach(node => {
      if (!node.node) return
      const node$ = node.node.node$
      if (!node$.attr('data-orig-r')) node$.attr('data-orig-r', node$.attr('r'))
      node.node.node$.attr('r', parseInt(node$.attr('data-orig-r')) * nodeSize)
    })
  }

  onNodesChange = (metaNodes: MetaNode[]) => {
    this.setState({ metaNodes }, () => {
      this.updateNodeSizes()
      this.updateUrlState()
    })
  }

  updateUrlState = () => {
    if (!history.pushState) return
    var newurl =
      window.location.protocol +
      '//' +
      window.location.host +
      window.location.pathname +
      this.encodeQuery()
    window.history.pushState({ path: newurl }, '', newurl)
  }

  decodeQuery: () => Partial<State> = () => {
    const search = decodeURIComponent(window.location.search.replace(/^\?/, ''))
    const nextState =
      search
        .split('&')
        .map(kv => kv.split('='))
        .filter(([key, value]) => key === 'state')
        .map(([_, encodedState]) =>
          JSON.parse(decodeURIComponent(encodedState))
        )[0] || {}
    delete nextState.metaNodes
    return nextState
  }

  encodeQuery = () => {
    const toEncode = {
      ...this.state,
      points: this.state.metaNodes.map(mn => mn.point)
    }
    delete toEncode.metaNodes
    return `?state=${encodeURIComponent(JSON.stringify(toEncode))}`
  }

  render () {
    const { length, numColumns, numRows } = this.state
    const centerPointOffset = length / 2 / Math.tan(RAD_THIRTY_DEG)
    return (
      <div id='root'>
        <TesselBoard
          length={length}
          displayConfig={
            this.state.displayMode === 'grid'
              ? grid
              : this.state.displayMode === 'gameboard'
                ? gameboard
                : {
                  ...gameboardProduction,
                  shapeCoordinates: getShapeCoordinates({ numRows, numColumns })
                } // eslint-disable-line
          }
          points={this.state.points}
          onNodesChange={this.onNodesChange}
          renderNodeSideCar={({ cy, cx, point, pointIndex, ...rest }) => (
            <Board.PointCircle
              {...{
                cx,
                cy: cy - centerPointOffset,
                stroke: this.state.edgeColor,
                ...rest
              }}
              children={
                <text
                  stroke='none'
                  fill={this.state.tokenNumberColor}
                  className='board-point-circle'
                  children={
                    TOKEN_VALUES[
                      (pointIndex! + this.state.tokenStartOffset) %
                        TOKEN_VALUES.length
                    ] // eslint-disable-line
                  }
                />
              }
            />
          )}
        />
        {this.state.showControls && (
          <ControlPanel
            {...{
              ...this.state,
              onEdgeColorChange: evt =>
                this.setState({ edgeColor: evt.currentTarget.value }, () => {
                  this.updateUrlState()
                  this.paintEdges()
                }),
              onToggleLineMode: () => {
                toggleLineMode(this.state.isCurvyLineMode)
                getPathEditor().render()
              },
              onTokenNumberColorChange: evt =>
                this.setState({ tokenNumberColor: evt.currentTarget.value }),
              onTokenOffsetChange: evt =>
                this.setState({
                  tokenStartOffset: parseInt(evt.currentTarget.value)
                }),
              onColumnCountChange: evt =>
                this.setState({
                  numColumns: parseInt(evt.currentTarget.value)
                }),
              onDisplayModeChange: evt =>
                this.setState(
                  { displayMode: evt.target.value as any },
                  this.updateUrlState
                ),
              onNodeSizeChange: (evt: any) =>
                this.setState(
                  { nodeSize: parseInt(evt.currentTarget.value) / 50 },
                  this.updateNodeSizes
                ),
              onRowCountChange: evt =>
                this.setState({ numRows: parseInt(evt.currentTarget.value) })
            }}
          />
        )}
        <button
          type='button'
          style={{ position: 'fixed', right: 5, top: 5 }}
          onClick={this.onToggleControls}
          children='controls'
        />
      </div>
    )
  }
}
