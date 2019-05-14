import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Tooltip, tooltipPropTypes } from './Tooltip'
import { Transition } from './Transition';

export class TooltipSource extends Component {
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
    triggered: false,
    sourceRef: null
  }
  timer = null;
  animationFrame = null

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
    const { delay, interactive } = this.props;
    if(delay && (!interactive || !this.state.triggered)) {
      this.timer = setTimeout(this.setHovered, delay)
    }
    else {
      this.setHovered();
    }
  }
  setHovered = () => this.setState({hovered: true, triggered: true});
  onMouseOut = () => {
    this.stopTimer();
    this.setState({hovered: false});
    if(this.props.interactive) {
      this.animationFrame = window.requestAnimationFrame(this.checkHovered)
    }
  }
  checkHovered = () => !this.state.hovered && this.setState({triggered: false})
  stopTimer = () => {
    clearTimeout(this.timer);
    this.timer = null;
  }
  setRef = (ref) => ref && !this.props.sourceRef && this.setSourceRef(ref.parentNode);
  componentDidMount = () => this.setSourceRef(this.props.sourceRef);
  componentWillUnmount = () => {
    this.stopTimer();
    this.clearHoverable(this.state.sourceRef);
    window.cancelAnimationFrame(this.animationFrame)
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
      interactive,
      sourceRef: _,
      duration,
      delay,
      ...rest
    } = this.props
    const {
      hovered,
      sourceRef,
      triggered,
    } = this.state
    return (
      <div 
        className={'tooltip-source'} 
        ref={this.setRef} 
        onMouseOver={(interactive && triggered) ? this.onMouseOver : undefined} 
        onMouseOut={(interactive && triggered) ? this.onMouseOut : undefined}
      >
        <Transition enter={sourceRef && (showing === undefined ? hovered : showing)} timeout={duration}>
          {(entering) => (
            <Tooltip
              sourceRef={sourceRef}
              entering={entering}
              interactive={interactive}
              duration={duration}
              {...rest}
            >
              {children}
            </Tooltip>
          )}
        </Transition>
      </div>
    )
  }
}