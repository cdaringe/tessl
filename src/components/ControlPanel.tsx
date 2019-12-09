import React from 'react'
import { getPathEditor } from './hacks'
import { DisplayMode, DISPLAYMODE } from './interfaces'
const SvgSaver = require('svgsaver')

const onSave = () => {
  var svgsaver = new SvgSaver()
  getPathEditor().setNodeVisibility(false)
  var svg = document.querySelector('#tesselboard')
  svgsaver.asSvg(svg)
  getPathEditor().setNodeVisibility(true)
}

export type Props = {
  displayMode: DisplayMode
  edgeColor: string
  tokenNumberColor: string
  nodeSize: number
  numColumns: number
  numRows: number
  onToggleLineMode: () => void
  onColumnCountChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onEdgeColorChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onTokenNumberColorChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onDisplayModeChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
  onNodeSizeChange: (evt: any) => void
  onRowCountChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onTokenOffsetChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  tokenStartOffset: number
}
export function ControlPanel ({
  displayMode,
  edgeColor,
  nodeSize,
  numColumns,
  numRows,
  onEdgeColorChange,
  onToggleLineMode,
  onTokenNumberColorChange,
  onColumnCountChange,
  onDisplayModeChange,
  onNodeSizeChange,
  onRowCountChange,
  onTokenOffsetChange,
  tokenNumberColor,
  tokenStartOffset
}: Props) {
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid lightgray',
        borderRadius: 3,
        padding: 8,
        position: 'fixed',
        right: 70,
        top: 10,
        zIndex: 2
      }}
    >
      <label htmlFor='node-size' children={`node size (${nodeSize})`} />
      <input
        id='node-size'
        type='range'
        min='1'
        max='100'
        className='slider'
        onChange={onNodeSizeChange}
      />
      <br />
      <button
        id='save-board'
        type='button'
        children='save svg'
        onClick={onSave}
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
      <button onClick={onToggleLineMode} children='toggle line mode' />
      <br />
      <select
        value={displayMode}
        onChange={onDisplayModeChange}
        children={Object.keys(DISPLAYMODE).map(mode => (
          <option key={mode} value={mode} children={mode} />
        ))}
      />
      <table>
        <tbody>
          {[
            [
              <label key='nc' htmlFor='num-columns' children='columns' />,
              <input
                key='nci'
                id='num-columns'
                value={numColumns}
                type='number'
                min='1'
                max='100'
                onChange={onColumnCountChange}
              />
            ],
            [
              <label key='nr' htmlFor='num-rows' children='rows' />,
              <input
                key='nri'
                id='num-rows'
                type='number'
                value={numRows}
                min='1'
                max='100'
                onChange={onRowCountChange}
              />
            ],
            [
              <label
                key='tso'
                htmlFor='token-start-offset'
                children='token start offset'
              />,
              <input
                key='tsoi'
                id='token-start-offset'
                type='number'
                value={tokenStartOffset}
                min='0'
                max='17'
                onChange={onTokenOffsetChange}
              />
            ],

            [
              <label key='ec' htmlFor='edge-color' children='edge color' />,
              <input
                key='eci'
                id='edge-color'
                type='color'
                value={edgeColor}
                onChange={onEdgeColorChange}
              />
            ],
            [
              <label
                key='tnc'
                htmlFor='token-number-color'
                children='token-number color'
              />,
              <input
                key='tnci'
                id='token-number-color'
                type='color'
                value={tokenNumberColor}
                onChange={onTokenNumberColorChange}
              />
            ]
          ].map((rowData, i) => (
            <tr
              key={i}
              children={rowData.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
