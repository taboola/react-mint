import React, { Component } from 'react';
import { Tooltip, TooltipPortal } from '../../src'

export class TestThree extends Component {
  state= {
    clicked: false,
  }
  render = () => {
    return (
      <div style={{marginLeft: 100, marginTop: 100, width: 300, height: 300, background: 'blue', position: 'relative'}}>
        <Tooltip position={'bottom'} inline={true} showing={true}>
            {'hewo2'}
        </Tooltip>
        <TooltipPortal>
          <div
            style={{height: 100, padding: 50}}
            className={'overflow'}
            onClick={() => this.setState(({clicked}) => ({clicked: !clicked}))}
          >
              <div style={{background: 'green', width: 50, height: 100000, position: 'relative', display: 'flex', flexDirection: 'column'}}>
                <div>
                  {'item'}
                  <Tooltip position={'bottom'}>
                      {'hewo'}
                  </Tooltip>
                </div>
              </div>
          </div>
      </TooltipPortal>
      </div>
    )
  }
}