import React from 'react'
import { render } from 'react-dom'

import { TestOne } from './TestOne';
import { TestTwo } from './TestTwo'
import { TestThree } from './TestThree'

render(
  <div style={{display: 'flex'}}>
   <TestTwo />
   <TestThree />
  </div>
 ,
  document.querySelector('#root')
);