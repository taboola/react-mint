import React from 'react'
import { render } from 'react-dom'

import { TestOne } from './TestOne';
import { TestTwo } from './TestTwo'

render(
  <TestTwo />,
  document.querySelector('#root')
);