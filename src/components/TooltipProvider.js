import React, { Component } from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid/v4';

import { defaultPortalId, shallowEqual } from '../utils'
import { TooltipContext, defaultContextValue } from './TooltipContext';

export class TooltipProvider extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    themes: PropTypes.object,
    defaultTheme: PropTypes.string,
    portal: PropTypes.bool,
    className: PropTypes.string,
    style: PropTypes.object,
    forwardedRef: PropTypes.object,
  }

  static defaultProps = {
    portal: true
  }

  state = { 
    value: defaultContextValue,
    portalId: `${defaultPortalId}-${uuid()}`,
    prevPortal: null,
    prevProviderValue: defaultContextValue
  }

  static getDerivedStateFromProps = ({themes, defaultTheme, portal, providerValue}, {value, prevPortal, prevProviderValue, portalId}) => {
    if(
      themes !== value.themes ||
      defaultTheme !== value.defaultTheme ||
      portal !== prevPortal ||
      !shallowEqual(providerValue, prevProviderValue)
    ) {
      let newValue = {...providerValue};
      if(themes) {
        newValue.themes = themes;
      }
      if(defaultTheme) {
        newValue.defaultTheme = defaultTheme;
      }
      if(portal) {
        newValue.portalId = portalId;
      }
      if(shallowEqual(value, newValue)) {
        newValue = value;
      }
      return {
        value: newValue,
        prevPortal: portal,
        prevProviderValue: providerValue,
      }
    }
    return null;
  }
  render = () => {
    const {
      portal,
      children,
      className,
      style,
      themes,
      defaultTheme,
      providerValue,
      forwardedRef,
      ...rest
    } = this.props
    const {
      value,
      portalId,
    } = this.state
    const wrappedChildren = portal
      ? <div ref={forwardedRef} id={portalId} className={className} style={style} {...rest}> {children} </div>
      : children
    return (      
      <TooltipContext.Provider value={value}>
        {wrappedChildren}
      </TooltipContext.Provider>
    )
  }
} 