import React, { Component } from 'react';
import { Tooltip, TooltipPortal } from '../../src'
import { TestOne } from './TestOne';

const themes = {
  default: {color: 'red', delay: 300, duration: 2000},
  night: {
    color: 'AliceBlue', 
    style: {
      color: 'black',
      boxShadow: '3px 3px 8px 0 rgba(0,0,0,0.25)',
    },
  }
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
            <Tooltip position={'right'} style={{color: 'orange'}}>
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