import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom'
import { shallowEqualForeignProps } from '../utils'
import Memoize from 'memoize-one'

const defaultColor = '#282828';
const defaultTailWidth = 6;
const defaultOffset = 6;
const getDefaultTransitionStyle = (entering, duration) => ({
  opacity: entering ? 1 : 0,
  transition: `opacity ${duration}ms ease-out`
})
const getTailHeight = (width) => width * .866

export const tooltipPropTypes = {
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  color: PropTypes.string,
  boxStyle: PropTypes.object,
  tailStyle: PropTypes.object,
  getTransitionStyle: PropTypes.func,
  tailWidth: PropTypes.number,
  offset: PropTypes.number,
  portalId: PropTypes.string,
  impure: PropTypes.bool,
  inline: PropTypes.bool,
}

export class Tooltip extends Component {
  static propTypes = {
    ...tooltipPropTypes,
    children: PropTypes.node.isRequired,
    sourceRef: PropTypes.instanceOf(Element),
    entering: PropTypes.bool,
    duration: PropTypes.number,
  }
  static defaultProps = {
    position: 'top',
    color: defaultColor,
    getTransitionStyle: getDefaultTransitionStyle,
    tailWidth: defaultTailWidth,
    offset: defaultOffset,
    portalId: 'tooltip'
  }
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
  componentDidUpdate = (prevProps) => {
    const {
      sourceRef: prevSourceRef
    } = prevProps
    const {
      sourceRef,
      impure,
      inline,
      position,
      tailWidth,
      offset,
    } = this.props
    if(impure || !shallowEqualForeignProps(this.props, prevProps, Tooltip.propTypes)) {
      this.setPosition()
    }
    else {
      if(sourceRef !== prevSourceRef) {
        this.setSourceRect();
        this.findScrollParent();
      }
      this.memoizedSetPosition(
        position,
        tailWidth,
        offset,
        inline,
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
    const { inline, position, tailWidth, offset } = this.props
    const {
      top: sourceTop,
      left: sourceLeft,
      width: sourceWidth,
      height: sourceHeight,
    } = this.setSourceRect();
    const {
      width: tooltipWidth,
      height: tooltipHeight,
    } = this.setTooltipRect();
    this.memoizedSetPosition(
      position,
      tailWidth,
      offset,
      inline,
      sourceTop,
      sourceLeft,
      sourceWidth,
      sourceHeight,
      tooltipWidth,
      tooltipHeight,
    )
  }
  memoizedSetPosition = Memoize((
    position,
    tailWidth,
    offset,
    inline,
    sourceTop,
    sourceLeft,
    sourceWidth,
    sourceHeight,
    tooltipWidth,
    tooltipHeight,
  ) => {
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
  setSourceRect = () => {
    this.sourceRect = this.props.sourceRef.getBoundingClientRect();
    return this.sourceRect;
  }
  setTooltipRect = () => {
    this.tooltipRect = this.tooltipRef.current.getBoundingClientRect();
    return this.tooltipRect;
  }
  findScrollParent = () => {
    let el = this.props.sourceRef;
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

  getBoxStyle = Memoize((color, boxStyle) => ({
    backgroundColor: color,
    color: '#fff',
    borderRadius: 4,
    padding: 8,
    ...boxStyle
  }))
  getTailStyle = Memoize((color, position, tailWidth, width, height, tailStyle) => {
    const style = {
      width: 0,
      height: 0,
      position: 'absolute',
      ...tailStyle
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
      portalId,
      inline,

      color,
      position,
      tailWidth,
      entering,
      duration,
      getTransitionStyle,
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
    return inline ? tooltip : createPortal(tooltip, document.getElementById(portalId))
  }
}