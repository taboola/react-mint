import React from 'react'
import { render } from 'react-dom'

import { TestOne } from './TestOne';
import { TestTwo } from './TestTwo'
import { TestThree } from './TestThree'
import { TestFour } from './TestFour'

render(
  <div style={{display: 'flex'}}>
   <TestTwo />
   <TestThree />
   <TestFour />
  </div>
 ,
  document.querySelector('#root')
);