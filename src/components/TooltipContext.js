import React, { createContext } from 'react';

export const defaultContextValue = {
  portalId: null,
  themes: null,
  defaultTheme: null,
}

export const TooltipContext = createContext(defaultContextValue)