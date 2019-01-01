import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom'

import { shallowEqualForeignProps, defaultPortalId } from '../utils'
import Memoize from 'memoize-one'

const defaultTailHeight = 6;
const defaultOffset = 6;
const getDefaultTransitionStyle = (entering) => ({
  opacity: entering ? 1 : 0,
  transitionProperty: 'opacity'
})
const defaultStyle = {
  background: '#282828',
}
const defaultBoxStyle = {
  borderRadius: 4,
  padding: 8,
  color: '#fff',
}
const getTailHeight = (width) => width * .866

export const tooltipPropTypes = {
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  color: PropTypes.string,
  style: PropTypes.object,
  boxStyle: PropTypes.object,
  tailStyle: PropTypes.object,
  getTransitionStyle: PropTypes.func,
  tailHeight: PropTypes.number,
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
    getTransitionStyle: getDefaultTransitionStyle,
    style: defaultStyle,
    boxStyle: defaultBoxStyle,
    tailHeight: defaultTailHeight,
    offset: defaultOffset,
    portalId: defaultPortalId
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
      tailHeight,
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
        tailHeight,
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
    const { inline, position, tailHeight, offset } = this.props
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
      tailHeight,
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
    tailHeight,
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
      top,
      left,
    })
  })
  setSourceRect = () => {
    const { sourceRef } = this.props
    if(sourceRef) {
      this.sourceRect = sourceRef.getBoundingClientRect();
    }
    return this.sourceRect;
  }
  setTooltipRect = () => {
    if(this.tooltipRef.current) {
      this.tooltipRect = this.tooltipRef.current.getBoundingClientRect();
    }
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
  getStyles = Memoize((style, boxStyle, tailStyle, getTransitionStyle, entering, duration) => {
    const {
      transition,
      transitionProperty,
      transitionDuration=`${duration}ms`,
      transitionTimingFunction='ease-out',
      transitionDelay,

      transform,
      padding,
      opacity,

      ...rest
    } = {
      ...style,
      ...(getTransitionStyle && getTransitionStyle(entering, duration))
    }
    let transitionStyle = null;
    if(transition) {
      transitionStyle = { transition }
    }
    else if(transitionProperty) {
      transitionStyle = {
        transitionProperty,
        transitionDuration,
        transitionTimingFunction,
        transitionDelay,
      }
    }
    const mergedBoxStyle = {
      ...boxStyle,
      ...rest,
    }
    const mergedMaskStyle = Object.entries(mergedBoxStyle).reduce((style, [key, value]) => {
      if((!/^border/.test(key) && !/^padding/.test(key) && key !== 'boxShadow') || key === 'borderRadius') {
        style[key] = value;
      }
      return style;
    }, {})
    return {
      boxStyle: {
        transform,
        padding,
        opacity,
        ...mergedBoxStyle,
        ...transitionStyle,
      },
      maskStyle: {
        ...mergedMaskStyle,
        ...transitionStyle,
      },
      tailStyle: {
        ...tailStyle,
        ...rest,
        ...transitionStyle,
      }
    }
  })

  getTooltipStyle = Memoize((top, left) => {
    return {
      position: 'absolute',
      pointerEvents: 'none',
      top,
      left,
    }
  })

  getMaskStyle = Memoize((maskStyle) => {
    return {
      width: '100%',
      height: '100%',
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      margin: 'auto',
      ...maskStyle
    }
  })

  getTailStyle = Memoize((position, tailHeight, tailStyle) => {
    const vertical = !(position === 'right' || position === 'left')
    const start = !(position === 'bottom' || position === 'right')
    const style = {
      width: tailHeight * 1.41,
      height: tailHeight * 1.41,
      position: 'absolute',
      margin: 'auto',
      zIndex: -1,
      ...tailStyle
    }
    switch(position) {
      case 'right':
        return {
          top: 0,
          bottom: 0,
          left: 0,
          transform: 'translateX(-50%) rotate(45deg)',
          ...style,
        }
      case 'bottom':
        return {
          top: 0,
          right: 0,
          left: 0,
          transform: 'translateY(-50%) rotate(45deg)',
          ...style,
        }
      case 'left':
        return {
          top: 0,
          right: 0,
          bottom: 0,
          transform: 'translateX(50%) rotate(45deg)',
          ...style,
        }
      default:
        return {
          right: 0,
          bottom: 0,
          left: 0,
          transform: 'translateY(50%) rotate(45deg)',
          ...style,
        }
    }
  })
  getPortalElement = Memoize((portalId) => {
    const element = document.getElementById(portalId);
    if(!element && process.env.NODE_ENV !== 'production') {
      throw new Error(`Could not find DOM element with ID ${portalId} to inject. Please provide a portalId which matches an existing DOM element or render a TooltipPortal as a parent to this element.`)
    }
    return element;
  })
  render = () => {
    const {
      children,
      portalId,
      inline,

      position,
      tailHeight,
      entering,
      duration,
      getTransitionStyle,
      style,
      boxStyle: propBoxStyle,
      tailStyle: propTailStyle,
    } = this.props

    const {
      top,
      left
    } = this.state
    const element = this.getPortalElement(portalId);
    if(!element) {
      return null;
    }
    const {
      boxStyle,
      maskStyle,
      tailStyle,
    } = this.getStyles(style, propBoxStyle, propTailStyle, getTransitionStyle, entering, duration)
    const tooltip = (
      <div style={this.getTooltipStyle(top, left)} ref={this.tooltipRef}>
        <div style={boxStyle}>
          <div style={{position: 'relative', zIndex: 1}}>
            {children}
          </div>
          <div style={this.getMaskStyle(maskStyle)}>
            <div style={this.getTailStyle(position, tailHeight, tailStyle)}/>
          </div>
        </div>
      </div>
    )
    return inline ? tooltip : createPortal(tooltip, element)
  }
}