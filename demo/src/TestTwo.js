import React, { Component } from 'react';
import { Tooltip, TooltipPortal } from '../../src'
import { TestOne } from './TestOne';

const themes = {
  default: { delay: 300, duration: 300},
  night: {
    duration: 300,
    getTransitionStyle: (entering, duration) => ({
      transform: `translateY(${entering ? 0 : 20}px) rotate(${entering ? 0 : 360}deg)`,
      backgroundColor: entering ? 'aliceblue' : 'orange',
      transition: `transform ${duration}ms ease-out,background-color ${duration}ms ease-out,opacity ${duration}ms ease-out`,
      opacity: entering ? 1 : 0,
    }),
    boxStyle: {
      borderRadius: 4,
      boxShadow: '3px 3px 8px 0 rgba(0,0,0,0.25)',
    },
    tailStyle: {
      boxShadow: '3px 0px 8px 0 rgba(0,0,0,0.25)',
    },
    style: {
      color: 'black',
      border: 'solid mediumpurple 2px',
      padding: 8,
    },
  }
}

export class TestTwo extends Component {
  portalRef = React.createRef();
  state= {
    clicked: false,
  }
  render = () => {
    return (
      <TooltipPortal
        ref={this.portalRef}
        themes={themes}
        defaultTheme={'night'}
        data-test={'test'}
      >
      <div>
          <div
            style={{backgroundColor: 'green', position: 'absolute', zIndex: 2, left: 20, width: 50, height: 50}}
            onClick={() => this.setState(({clicked}) => ({clicked: !clicked}))}
          >
            <div style={{position: 'relative', zIndex: 4, backgroundColor: 'red', width: 20, height: 20}}> stuff </div>
            <Tooltip position={'right'} interactive={true} delay={1000}>
              {'hewo'}
            </Tooltip>
          </div>
          <div style={{backgroundColor: 'orange', position: 'absolute', zIndex: 3, width: 30, height: 30}}></div>
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