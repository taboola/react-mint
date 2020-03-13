import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom'

import { shallowEqualForeignProps, defaultPortalId } from '../utils'
import Memoize from 'memoize-one'

const defaultTailHeight = 6;
const defaultOffset = 6;
const defaultOffsetBody = 0;
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
  style: PropTypes.object,
  boxStyle: PropTypes.object,
  tailStyle: PropTypes.object,
  getTransitionStyle: PropTypes.func,
  boxClassName: PropTypes.string,
  maskClassName: PropTypes.string,
  tailClassName: PropTypes.string,
  tailHeight: PropTypes.number,
  offset: PropTypes.number,
  offsetBody: PropTypes.number,
  portalId: PropTypes.string,
  pure: PropTypes.bool,
  inline: PropTypes.bool,
  interactive: PropTypes.bool,
}

export class Tooltip extends Component {
  static propTypes = {
    ...tooltipPropTypes,
    children: PropTypes.node.isRequired,
    sourceRef: PropTypes.instanceOf(Element),
    scrollRef: PropTypes.instanceOf(Element),
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
    offsetBody: defaultOffsetBody,
    portalId: defaultPortalId,
    pure: true,
    inline: false,
    interactive: false,
  }
  static onScroll = () => Tooltip.scrollers.forEach(thunk => thunk())
  static scrollers = [];
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
  portalRect = {
    top: 0,
    left: 0,
  }
  scrollParent = null;
  scrollParentThunk = null;
  throttling = false;
  unmounted = false;
  componentDidMount = () => {
    this.setPosition();
    this.findScrollParent();
    Tooltip.scrollers.push(this.onScroll)
  }
  componentWillUnmount = () => {
    this.unmounted = true;
    // if(this.scrollParent) {
    //   this.scrollParent.onscroll = this.scrollParentThunk;
    // }
    Tooltip.scrollers = Tooltip.scrollers.filter(thunk => thunk !== this.onScroll)
  }
  componentDidUpdate = (prevProps) => {
    const {
      sourceRef: prevSourceRef,
      portalId: prevPortalId,
    } = prevProps
    const {
      sourceRef,
      portalId,
      pure,
      inline,
      position,
      tailHeight,
      offset,
      offsetBody,
    } = this.props
    if(!pure || !shallowEqualForeignProps(this.props, prevProps, Tooltip.propTypes)) {
      this.setPosition()
    }
    else {
      if(portalId !== prevPortalId) {
        this.setPortalRect();
      }
      if(sourceRef !== prevSourceRef) {
        this.setSourceRect();
        this.findScrollParent();
      }
      this.memoizedSetPosition(
        position,
        tailHeight,
        offset,
        offsetBody,
        inline,
        this.sourceRect.top,
        this.sourceRect.left,
        this.sourceRect.width,
        this.sourceRect.height,
        this.tooltipRect.width,
        this.tooltipRect.height,
        this.portalRect.top,
        this.portalRect.left,
      )
    }
  }

  setPosition = () => {
    const { inline, position, tailHeight, offset, offsetBody } = this.props
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
    const { 
      top: portalTop,
      left: portalLeft,
    } = this.setPortalRect();
    this.memoizedSetPosition(
      position,
      tailHeight,
      offset,
      offsetBody,
      inline,
      sourceTop,
      sourceLeft,
      sourceWidth,
      sourceHeight,
      tooltipWidth,
      tooltipHeight,
      portalTop,
      portalLeft,
    )
  }
  memoizedSetPosition = Memoize((
    position,
    tailHeight,
    offset,
    offsetBody,
    inline,
    sourceTop,
    sourceLeft,
    sourceWidth,
    sourceHeight,
    tooltipWidth,
    tooltipHeight,
    portalTop,
    portalLeft,
  ) => {
    let left = -portalLeft;
    let top = -portalTop;
    if(!inline) {
      left += sourceLeft
      top += sourceTop
    }
    const totalOffset = tailHeight + offset;
    switch(position) {
      case 'left':
        top += ((sourceHeight - tooltipHeight) / 2) + offsetBody
        left -= (tooltipWidth + totalOffset);
        break;
      case 'bottom':
        top += (sourceHeight + totalOffset)
        left += ((sourceWidth - tooltipWidth) / 2) + offsetBody
        break;
      case 'right':
        top += ((sourceHeight - tooltipHeight) / 2) + offsetBody
        left += (sourceWidth + totalOffset)
        break;
      default:
        top -= (tooltipHeight + totalOffset)
        left += ((sourceWidth - tooltipWidth) / 2) + offsetBody
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
      this.sourceRect = (sourceRef.current || sourceRef).getBoundingClientRect();
    }
    return this.sourceRect;
  }
  setTooltipRect = () => {
    if(this.tooltipRef.current) {
      this.tooltipRect = this.tooltipRef.current.getBoundingClientRect();
    }
    return this.tooltipRect;
  }
  setPortalRect = () => {
    const { portalId, inline } = this.props
    if(portalId && !inline) {
      this.portalRect = document.getElementById(portalId).getBoundingClientRect();
    }
    return this.portalRect
  }
  findScrollParent = () => {
    const { sourceRef, scrollRef } = this.props;
    let scrollParent = null;
    if(scrollRef) {
      scrollParent = (scrollRef || scrollRef.current)
    }
    else {
      let el = sourceRef;
      while (el && el.parentNode && el.parentNode !== document) {
        el = el.parentNode;
        const style = getComputedStyle(el)
        if(
          style && (
            style['overflow-y'] === 'scroll'
            || style['overflow-y'] === 'auto'
              || style['overflow-x'] === 'scroll'
                || style['overflow-x'] === 'auto'
          )
        ) {
          scrollParent = el;
          break;
        }
      }
    }
    if(scrollParent && this.scrollParent !== scrollParent) {
      this.scrollParent = scrollParent;
      this.scrollParentThunk = scrollParent.onscroll;
      // this.scrollParent.onscroll = () => {
      //   this.onScroll();
      //   this.scrollParentThunk && this.scrollParentThunk();
      // }
      this.scrollParent.onscroll = Tooltip.onScroll
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
  getStyles = Memoize((style, boxStyle, tailStyle, getTransitionStyle, entering, duration, position) => {
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
      ...(getTransitionStyle && getTransitionStyle(entering, duration, position))
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

  getTooltipStyle = Memoize((top, left, interactive) => {
    return {
      position: 'absolute',
      pointerEvents: !interactive && 'none',
      top,
      left,
    }
  })

  getInteractiveStyle = Memoize((position, tailHeight, offset) => {
    const totalOffset = tailHeight + offset;
    let positionStyle = null;
    switch(position) {
      case 'left':
        positionStyle = {
          right: -totalOffset,
          width: totalOffset,
        }
        break;
      case 'bottom':
      positionStyle = {
        top: -totalOffset,
        height: totalOffset,
      }
        break;
      case 'right':
        positionStyle = {
          left: -totalOffset,
          width: totalOffset,
        }
        break;
      default:
        positionStyle = {
          bottom: -totalOffset,
          height: totalOffset,
        }
        break;
    }
    return {
      position: 'absolute',
      width: '100%',
      height: '100%',
      ...positionStyle,
    }
  })

  getMaskStyle = Memoize((maskStyle) => {
    return {
      width: '100%',
      height: '100%',
      position: 'absolute',
      zIndex: 1,
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      margin: 'auto',
      ...maskStyle
    }
  })

  getTailStyle = Memoize((position, tailHeight, tailStyle, offsetBody) => {
    const vertical = !(position === 'right' || position === 'left')
    const start = !(position === 'bottom' || position === 'right')
    const style = {
      width: tailHeight * 1.41,
      height: tailHeight * 1.41,
      position: 'absolute',
      zIndex: 0,
      ...tailStyle
    }
    switch(position) {
      case 'right':
        return {
          top: `calc(50% - ${offsetBody}px)`,
          bottom: 0,
          left: 0,
          transform: 'translate(-50%, -50%) rotate(45deg)',
          ...style,
        }
      case 'bottom':
        return {
          top: 0,
          right: 0,
          left: `calc(50% - ${offsetBody}px)`,
          transform: 'translate(-50%, -50%) rotate(45deg)',
          ...style,
        }
      case 'left':
        return {
          top: `calc(50% - ${offsetBody}px)`,
          right: 0,
          bottom: 0,
          transform: 'translate(50%, -50%) rotate(45deg)',
          ...style,
        }
      default:
        return {
          right: 0,
          bottom: 0,
          left: `calc(50% - ${offsetBody}px)`,
          transform: 'translate(-50%, 50%) rotate(45deg)',
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
      offset,
      offsetBody,
      entering,
      duration,
      interactive,
      getTransitionStyle,
      style,
      boxStyle: propBoxStyle,
      tailStyle: propTailStyle,
      boxClassName,
      maskClassName,
      tailClassName,
    } = this.props

    const {
      top,
      left
    } = this.state
    let element = null; 
    if(!inline) {
      element = this.getPortalElement(portalId);
    }
    const {
      boxStyle,
      maskStyle,
      tailStyle,
    } = this.getStyles(style, propBoxStyle, propTailStyle, getTransitionStyle, entering, duration, position)
    const tooltip = (
      <div style={this.getTooltipStyle(top, left, interactive)} ref={this.tooltipRef}>
        {interactive && <div style={this.getInteractiveStyle(position, tailHeight, offset)}/>}
        <div style={boxStyle} className={boxClassName}>
          <div style={{position: 'relative', zIndex: 2}}>
            {children}
          </div>
          {tailHeight > 0 && <div style={this.getMaskStyle(maskStyle)} className={maskClassName}/>}
          {tailHeight > 0 && <div style={this.getTailStyle(position, tailHeight, tailStyle, offsetBody)} className={tailClassName} />}
        </div>
      </div>
    )
    return inline ? tooltip : createPortal(tooltip, element)
  }
}
