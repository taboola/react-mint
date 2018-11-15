import React, { Component, createRef } from 'react';
import { createPortal } from 'react-dom'
import { shallowEqual } from './utils'
import Memoize from 'memoize-one'

const defaultColor = '#282828';
const defaultTailWidth = 6;
const defaultOffset = 6;
const getTailHeight = (width) => width * .866

export default class Tooltip extends Component {
  state = {
    width: 0,
    height: 0,
    top: 0,
    left: 0,
  }
  tooltipRef = createRef();
  sourceRect = {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  };
  tooltipRect = {
    width: 0,
    height: 0,
  };
  scrollParent = null;
  throttling = false;
  unmounted = false;
  componentDidMount = () => { 
    this.setPosition();
    this.findScrollParent();
  }
  componentWillUnmount = () => {
    this.unmounted = true;
    if(this.scrollParent) {
      this.scrollParent.onscroll = null;
    }
  }
  componentDidUpdate = (prevProps, prevState) => {
    const {
      children: prevChildren,
      elementId: prevElementId,
      impure: prevImpure,
      inline: prevInline,
      position: prevPosition,
      tailWidth: prevTailWidth,
      offset: prevOffset,
      entering: prevEntering,
      duration: prevDuration,
      getTransitionStyle: prevGetTransitionStyle,
      ...prevRest
    } = prevProps
    const {
      children,
      elementId,
      impure,
      inline,
      position,
      tailWidth,
      offset,
      entering,
      duration,
      getTransitionStyle,
      ...rest
    } = this.props
    if(impure || !shallowEqual(rest, prevRest)) {
      //console.log('update')
      this.setPosition()
    }
    else {
      this.memoizedSetPosition(
        inline, 
        position, 
        tailWidth, 
        offset,
        this.sourceRect.top, 
        this.sourceRect.left, 
        this.sourceRect.width, 
        this.sourceRect.height, 
        this.tooltipRect.width, 
        this.tooltipRect.height,
      )
    }
  }

  setPosition = () => {
    const { sourceRef, inline, position, tailWidth, offset } = this.props
    //const { tooltipWidth, tooltipHeight } = this.state
    this.sourceRect = sourceRef.getBoundingClientRect();
    const {
      top: sourceTop,
      left: sourceLeft,
      width: sourceWidth,
      height: sourceHeight,
    } = this.sourceRect;
    this.tooltipRect = this.tooltipRef.current.getBoundingClientRect();
    const {
      width: tooltipWidth,
      height: tooltipHeight,
    } = this.tooltipRect;
    //console.log('set')
    this.memoizedSetPosition(
      inline, 
      position, 
      tailWidth, 
      offset,
      sourceTop, 
      sourceLeft, 
      sourceWidth, 
      sourceHeight, 
      tooltipWidth, 
      tooltipHeight,
    )
  }
  memoizedSetPosition = Memoize((
    inline, 
    position, 
    tailWidth=defaultTailWidth, 
    offset=defaultOffset,
    sourceTop, 
    sourceLeft, 
    sourceWidth, 
    sourceHeight, 
    tooltipWidth, 
    tooltipHeight, 
  ) => {
    //console.log('mem')
    let left = 0;
    let top = 0;
    if(!inline) {
      left = sourceLeft
      top = sourceTop
    }
    const tailHeight = getTailHeight(tailWidth)
    const totalOffset = tailHeight + offset;
    switch(position) {
      case 'left': 
        top += ((sourceHeight - tooltipHeight) / 2);
        left -= (tooltipWidth + totalOffset);
        break;
      case 'bottom':
        top += (sourceHeight + totalOffset)
        left += ((sourceWidth - tooltipWidth) / 2);
        break;
      case 'right':
        top += ((sourceHeight - tooltipHeight) / 2)
        left += (sourceWidth + totalOffset)
        break;
      default:
        top -= (tooltipHeight + totalOffset)
        left += ((sourceWidth - tooltipWidth) / 2)
        break;
    }
    
    this.setState({
      width: tooltipWidth,
      height: tooltipHeight,
      top,
      left,
    })
  })
  findScrollParent = () => {
    const { sourceRef } = this.props
    let el = sourceRef;
    while (el && el.parentNode) {
      el = el.parentNode;
      if(
        el.style && (
          el.style['overflow-x'] === 'scroll' 
          || el.style['overflow-y'] === 'scroll'
        )
      ) {
        this.scrollParent = el;
        el.onscroll = this.onScroll;
        break;
      }
    }
  }
  onScroll = () => {
    if (!this.throttling) {
      window.requestAnimationFrame(() => {
        if(this.unmounted) return;
        this.setPosition();
        this.throttling = false;
      });
      this.throttling = true;
    }
  }

  getTooltipStyle = Memoize((top, left) => {
    return {
      position: 'absolute', 
      pointerEvents: 'none', 
      top,
      left,
    }
  })
  getDefaultTransitionStyle = (entering, duration) => ({
    opacity: entering ? 1 : 0,
    transition: `opacity ${duration}ms ease-out`
  })
 
  getBoxStyle = Memoize((color=defaultColor) => ({
    backgroundColor: color,
    color: '#fff',
    borderRadius: 4,
    padding: 8,
  }))
  getTailStyle = Memoize((color=defaultColor, position, tailWidth=defaultTailWidth, width, height) => {
    const style = {
      width: 0,
      height: 0,
      position: 'absolute',
    }
    const legBorder = `${tailWidth}px solid transparent`;
    const baseBorder = `${tailWidth}px solid ${color}`;
    const tailHeight = getTailHeight(tailWidth)
    switch(position) {
      case 'right':
        return {
          borderTop: legBorder,
          borderBottom: legBorder,
          borderRight: baseBorder,
          top: height / 2 - tailWidth,
          left: -tailHeight,
          ...style,
        }
      case 'bottom':
        return {
          borderRight: legBorder,
          borderLeft: legBorder,
          borderBottom: baseBorder,
          top: -tailHeight,
          left: width / 2 - tailWidth,
          ...style,
        }
      case 'left':
        return {
          borderTop: legBorder,
          borderBottom: legBorder,
          borderLeft: baseBorder,
          top: height / 2 - tailWidth,
          left: width,
          ...style,
        }
      default:
        return {
          borderRight: legBorder,
          borderLeft: legBorder,
          borderTop: baseBorder,
          top: height,
          left: width / 2 - tailWidth,
          ...style,
        }
    }
  })
  render = () => {
    const { 
      children, 
      elementId='tooltip', 
      inline,
      sourceRef,

      color,
      position,
      tailWidth,
      entering,
      duration,
      getTransitionStyle=this.getDefaultTransitionStyle,
    } = this.props

    const {
      width,
      height,
      top,
      left
    } = this.state
    const tooltip = (
      <div style={this.getTooltipStyle(top, left)} ref={this.tooltipRef}>
        <div style={getTransitionStyle(entering, duration)}>
          <div style={this.getBoxStyle(color)}>
            {children}
          </div>
          <div style={this.getTailStyle(color, position, tailWidth, width, height)}/>
        </div>
      </div>
    )
    return inline ? tooltip : createPortal(tooltip, document.getElementById(elementId))
  }
}