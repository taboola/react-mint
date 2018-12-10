import React, { Component } from 'react';
import { Tooltip, TooltipPortal } from '../../src'
import { TestOne } from './TestOne';

const themes = {
  default: {color: 'red'},
  night: {color: 'AliceBlue', boxStyle: {color: 'black'}}
}

export class TestTwo extends Component {
  state= {
    clicked: false,
  }
  render = () => {
    return (
      <TooltipPortal
        themes={themes}
        defaultTheme={'night'} 
      >
      <div>
          <div 
            style={{backgroundColor: 'green', position: 'absolute', zIndex: 2, left: 20, width: 50, height: 50}}
            onClick={() => this.setState(({clicked}) => ({clicked: !clicked}))}
          >
            <Tooltip position={'right'} showing={true}>
              {'hewo'}
            </Tooltip>
          </div>
          <div>
            <div style={{position: 'relative'}}>
            <TestOne/>
            </div>
          </div>
      </div>
      </TooltipPortal>
    )
  }
}