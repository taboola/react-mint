import React from 'react';

import { TooltipProvider } from './TooltipProvider'
import { TooltipContext } from './tooltipContext';

export const TooltipProviderWrapper = (props) => (
  <TooltipContext.Consumer>
    {(providerValue) => (
      <TooltipProvider providerValue={providerValue} {...props}/>
    )}
  </TooltipContext.Consumer>
)