import './App.css'
import { TesselBoard } from './TesselBoard'
import React, { PureComponent } from 'react'
import { MetaNode, fromPoints } from '@dino-dna/d3-svg-path-editor'
var SvgSaver = require('svgsaver')

const getPathEditor: () => ReturnType<typeof fromPoints> = () =>
  (window as any)._pathEditor

type State = {
  showControls: boolean
  nodeSize: number
  nodes: MetaNode[]
}
export class App extends PureComponent<any, State> {
  constructor (props: any) {
    super(props)
    this.state = { showControls: false, nodeSize: 1, nodes: [] }
  }

  onToggleControls = () => {
    this.setState({ showControls: !this.state.showControls })
  }

  onSave = () => {
    var svgsaver = new SvgSaver()
    getPathEditor().setNodeVisibility(false)
    var svg = document.querySelector('#tesselboard')
    svgsaver.asSvg(svg)
    getPathEditor().setNodeVisibility(true)
  }

  updateNodeSizes = () => {
    const { nodeSize } = this.state
    this.state.nodes.forEach(node => {
      if (!node.node) return
      const node$ = node.node.node$
      if (!node$.attr('data-orig-r')) node$.attr('data-orig-r', node$.attr('r'))
      node.node.node$.attr('r', parseInt(node$.attr('data-orig-r')) * nodeSize)
    })
  }

  onNodeSizeChange = (evt: any) => {
    const nodeSize = parseInt(evt.currentTarget.value) / 50
    this.setState({ nodeSize })
    this.updateNodeSizes()
  }

  onNodesChange = (nodes: MetaNode[]) => {
    this.setState({ nodes })
    this.updateNodeSizes()
  }

  render () {
    return (
      <div id='root'>
        <TesselBoard onNodesChange={this.onNodesChange} />
        {this.state.showControls && (
          <div
            style={{
              background: 'white',
              position: 'fixed',
              right: 70,
              top: 10,
              zIndex: 2
            }}
          >
            <label
              htmlFor='node-size'
              children={`node size (${this.state.nodeSize})`}
            />
            <input
              id='node-size'
              type='range'
              min='1'
              max='100'
              className='slider'
              onChange={this.onNodeSizeChange}
            />
            <br />
            <button
              id='save-board'
              type='button'
              children='save svg'
              onClick={this.onSave}
            />
            <button
              id='hide-nodes'
              type='button'
              children='hide nodes'
              onClick={() => getPathEditor().setNodeVisibility(false)}
            />
            <button
              id='show-nodes'
              type='button'
              children='show nodes'
              onClick={() => getPathEditor().setNodeVisibility(true)}
            />
            <button
              onClick={() => {
                ;(window as any).__LINE_MODE_CURVY__ = !(window as any)
                  .__LINE_MODE_CURVY__
                getPathEditor().render()
              }}
              children='toggle line mode'
            />
          </div>
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
