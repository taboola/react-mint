import React, { Component } from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid/v4';
import { defaultPortalId, shallowEqual } from '../utils'
import { TooltipContext, defaultContextValue } from './tooltipContext';

export class TooltipProvider extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    themes: PropTypes.object,
    defaultTheme: PropTypes.string,
    portal: PropTypes.bool
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
    } = this.props
    const {
      value,
      portalId,
    } = this.state
    const wrappedChildren = portal
      ? <div id={portalId}> {children} </div>
      : children
    return (      
      <TooltipContext.Provider value={value}>
        {wrappedChildren}
      </TooltipContext.Provider>
    )
  }
} 