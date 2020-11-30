import React, { forwardRef } from 'react';

import { TooltipProvider } from './TooltipProvider'
import { TooltipContext } from './TooltipContext';

export const TooltipProviderWrapper = forwardRef((props, ref) => (
  <TooltipContext.Consumer>
    {(providerValue) => (
      <TooltipProvider providerValue={providerValue} forwardedRef={ref} {...props}/>
    )}
  </TooltipContext.Consumer>
))