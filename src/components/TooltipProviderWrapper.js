import React from 'react';

import { TooltipProvider } from './TooltipProvider'
import { TooltipContext } from './TooltipContext';

export const TooltipProviderWrapper = (props) => (
  <TooltipContext.Consumer>
    {(providerValue) => (
      <TooltipProvider providerValue={providerValue} {...props}/>
    )}
  </TooltipContext.Consumer>
)