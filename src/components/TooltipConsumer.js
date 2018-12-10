import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tooltip, tooltipPropTypes } from './Tooltip'
import { Transition } from './Transition';
import { TooltipContext } from './tooltipContext';
import { defaultPortalId } from '../utils';

export class TooltipConsumer extends Component {
  static propTypes = {
    ...tooltipPropTypes,
    children: PropTypes.node.isRequired,
    sourceRef: PropTypes.instanceOf(Element),
    duration: PropTypes.number,
    delay: PropTypes.number,
    theme: PropTypes.string,
    showing: PropTypes.bool,
    hoverable: PropTypes.bool,
    clickable: PropTypes.bool,
  }
  static defaultProps = {
    duration: 300,
    delay: 0,
    hoverable: true,
    clickable: false,
  }
  state = {
    hovered: false,
    sourceRef: null
  }
  timer = null;

  setSourceRef = (ref) => {
    if(!ref) return this.state.sourceRef;
    this.setHoverable(ref);
    this.setState({sourceRef: ref})
    return ref;
  }
  setHoverable = (ref) => {
    if(ref) {
      const { hoverable, clickable } = this.props
      this.clearHoverable(ref);
      if(clickable) {
        ref.onmousedown = this.onMouseClick
      }
      else if(hoverable) {
        ref.onmouseenter = this.onMouseOver
        ref.onmouseleave = this.onMouseOut
      }
    }
  }
  clearHoverable = (ref) => {
    if(ref) {
      ref.onmouseenter = null;
      ref.onmouseleave = null;
      ref.onmousedown = null;
    }
  }
  onMouseClick = () => this.state.hovered ? this.onMouseOut() : this.onMouseOver();
  onMouseOver = () => {
    const { delay } = this.props;
    if(delay) {
      this.timer = setTimeout(this.setHovered, delay)
    }
    else {
      this.setHovered();
    }
  }
  setHovered = () => this.setState({hovered: true});
  onMouseOut = () => {
    this.stopTimer();
    this.setState({hovered: false});
  }
  stopTimer = () => {
    clearInterval(this.timer);
    this.timer = null;
  }
  setRef = (ref) => ref && !this.props.sourceRef && this.setSourceRef(ref.parentNode);
  componentDidMount = () => this.setSourceRef(this.props.sourceRef);
  componentWillUnmount = () => {
    this.stopTimer();
    this.clearHoverable(this.state.ref);
  }
  componentDidUpdate = (prevProps, { sourceRef: curSourceRef }) => {
    const { sourceRef, hoverable, clickable } = this.props;
    const { sourceRef: prevSourceRef, hoverable: prevHoverable, clickable: prevClickable } = prevProps
    if(sourceRef !== prevSourceRef && sourceRef !== curSourceRef) {
      this.setSourceRef(sourceRef);
    }
    if(hoverable !== prevHoverable || clickable !== prevClickable) {
      this.setHoverable(curSourceRef)
    }
  }
  render = () => {
    const {
      children,
      showing,
      sourceRef: _,
      duration,
      delay,
      theme,
      ...rest
    } = this.props
    const {
      hovered,
      sourceRef
    } = this.state
    return (
      <TooltipContext.Consumer>
        {({themes, defaultTheme, portalId}) => {
          let themeProps = themes && (themes[theme] || themes[defaultTheme]);
          return (
            <div className={'tooltip-source'} ref={this.setRef}>
              <Transition enter={sourceRef && (hovered || showing)} timeout={duration}>
                {(entering) => (
                  <Tooltip
                    sourceRef={sourceRef}
                    entering={entering}
                    duration={duration}
                    portalId={portalId || defaultPortalId}
                    {...themeProps}
                    {...rest}
                  >
                    {children}
                  </Tooltip>
                )}
              </Transition>
            </div>
          )
        }}
      </TooltipContext.Consumer>
    )
  }
}