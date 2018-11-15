import React from 'react'
import { render } from 'react-dom'

import { Test } from './Test'

render(
  <div id={'tooltip'}>
    <Test />
  </div>, 
  document.querySelector('#root')
);