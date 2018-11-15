import React, { Component } from 'react';
import { Tooltip } from '../../src' 

export class Test extends Component {
  render = () => {
    return (
      <div>
        <div style={{display: 'inline-block', backgroundColor: 'purple', width: '100px'}}>
          <Tooltip position={'bottom'}>
            {'test tip'}
          </Tooltip>
          {'test'}
        </div>
        <div>
          <div style={{display: 'inline-block', backgroundColor: 'blue', width: '50px'}}>{'test2'}</div>
        </div>
      </div>
    )
  }
}