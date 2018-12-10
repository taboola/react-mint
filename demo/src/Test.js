import React, { Component } from 'react';
import { Tooltip } from '../../src'

export class Test extends Component {
  state = {
    width: 100,
    clicked: true,
  }
  render = () => {
    return (
      <div>
        <div
          style={{
            marginLeft: 200,
            display: 'inline-block',
            backgroundColor: 'purple',
            width: '100px'
          }}
          // onClick={() => this.setState(({clicked}) => ({
          //   width: 200,
          //   clicked: !clicked
          // }))}
        >
          <Tooltip position={'right'} width={this.state.width} clickable={this.state.clicked}>
            <div style={{width: this.state.width}}>
              {'test tip'}
              {'test 2'}
            </div>
          </Tooltip>
          {'test'}
        </div>
        <div onClick={() => this.setState(({clicked}) => ({
            width: 200,
            clicked: !clicked
          }))}>
          <div style={{display: 'inline-block', backgroundColor: 'blue', width: '50px'}}>{'test2'}</div>
        </div>
      </div>
    )
  }
}