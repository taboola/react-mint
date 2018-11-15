import React, { Component } from 'react';
import Tooltip from './Tooltip'
import { Transition } from './Transition';

export class TooltipConsumer extends Component {
  state = {
    hovered: false,
    //clicked: false,
    sourceRef: null
  }
  timer = null;

  setRef = (ref) => ref && !this.props.sourceRef && this.setSourceRef(ref.parentNode);
  setSourceRef = (ref) => {
    if(!ref) return;
    ref.onmouseenter = this.onMouseOver;
    ref.onmouseleave = this.onMouseOut;
    this.setState({sourceRef: ref})
  }
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
  componentDidMount = () => this.setSourceRef(this.props.sourceRef)
  componentWillUnmount = this.stopTimer
  componentDidUpdate = (_, {sourceRef: prevSourceRef}) => {
    const { sourceRef } = this.props;
    sourceRef !== prevSourceRef && this.setSourceRef(sourceRef)
  }
  render = () => {
    const { 
      children,
      show,
      sourceRef: _,
      duration=350,
      delay,
      ...rest
    } = this.props
    const {
      hovered,
      sourceRef
    } = this.state
    return (
      <div ref={this.setRef}>
        <Transition enter={sourceRef && (hovered || show)} timeout={duration}>
          {(entering) => (
            <Tooltip
              sourceRef={sourceRef}
              entering={entering}
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