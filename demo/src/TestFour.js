import React, { Component } from 'react';
import { Tooltip, TooltipPortal } from '../../src'

export class TestFour extends Component {
  state = {
    width: 12,
    clicked: true,
  }
  render = () => {
    return (
      <TooltipPortal
        //portal={this.state.clicked}
        themes={{
          default: null,
          night: null,
        }}
        style={{position: 'relative'}}
        // defaultTheme={this.state.clicked ? 'night' : 'default'}
      >
        <div
          style={{
            marginLeft: 200,
            marginTop: 200,
            display: 'inline-block',
            backgroundColor: 'purple',
            width: 50,
            height: 50
          }}
          // onClick={() => this.setState(({clicked}) => ({
          //   width: 200,
          //   clicked: !clicked
          // }))}
        >
          <Tooltip position={'top-end'} test={this.state.width} showing={true} interactive={true}>
            <div style={{width: 100}}>
              {'test tip'}
            </div>
          </Tooltip>
          <Tooltip position={'right-end'} test={this.state.width} showing={true} interactive={true}>
            <div style={{height: 100}}>
              {'test tip'}
            </div>
          </Tooltip>
          <Tooltip position={'left-start'} test={this.state.width} showing={true} interactive={true}>
            <div style={{height: 100}}>
              {'test tip'}
            </div>
          </Tooltip>
          <Tooltip position={'bottom-start'} test={this.state.width} showing={true} interactive={true}>
            <div style={{width: 100}}>
              {'test tip'}
            </div>
          </Tooltip>
          {'test'}
        </div>
        <div
          style={{
            marginLeft: 200,
            marginTop: 200,
            display: 'inline-block',
            backgroundColor: 'purple',
            width: 50,
            height: 50
          }}
          // onClick={() => this.setState(({clicked}) => ({
          //   width: 200,
          //   clicked: !clicked
          // }))}
        >
          <Tooltip position={'top-start'} test={this.state.width} showing={true} interactive={true}>
            <div style={{width: 100}}>
              {'test tip'}
            </div>
          </Tooltip>
          <Tooltip position={'right-start'} test={this.state.width} showing={true} interactive={true}>
            <div style={{height: 100}}>
              {'test tip'}
            </div>
          </Tooltip>
          <Tooltip position={'left-end'} test={this.state.width} showing={true} interactive={true}>
            <div style={{height: 100}}>
              {'test tip'}
            </div>
          </Tooltip>
          <Tooltip position={'bottom-end'} test={this.state.width} showing={true} interactive={true}>
            <div style={{width: 100}}>
              {'test tip'}
            </div>
          </Tooltip>
          {'test'}
        </div>
      </TooltipPortal>
    )
  }
}