import React from 'react'
import { render } from 'react-dom'

import { TestOne } from './TestOne';
import { TestTwo } from './TestTwo'
import { TestThree } from './TestThree'

render(
  <TestTwo />,
  document.querySelector('#root')
);