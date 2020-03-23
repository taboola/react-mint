import React, { Component } from 'react';

import { TooltipSource } from './TooltipSource'
import { TooltipContext } from './TooltipContext';
import { defaultPortalId } from '../utils'

export const TooltipSourceWrapper = ({ theme, style, boxStyle, tailStyle, ...rest}) => (
  <TooltipContext.Consumer>
    {({themes, defaultTheme, portalId}) => {
      let themeProps = themes && (themes[theme] || themes[defaultTheme]);
      if(themeProps) {
        style = (themeProps.style || style) && {...themeProps.style, ...style}
        boxStyle = (themeProps.boxStyle || boxStyle) && {...themeProps.boxStyle, ...boxStyle}
        tailStyle = (themeProps.tailStyle || tailStyle) && {...themeProps.tailStyle, ...tailStyle}
      }
      return (
        <TooltipSource
          portalId={portalId}
          {...themeProps}
          {...rest}
          style={style}
          boxStyle={boxStyle}
          tailStyle={tailStyle}
        />
      )
    }}
  </TooltipContext.Consumer>
)