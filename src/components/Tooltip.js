import React, { Component, createRef } from "react";
import PropTypes from "prop-types";
import { createPortal } from "react-dom";

import { shallowEqualForeignProps, defaultPortalId } from "../utils";
import Memoize from "memoize-one";

const defaultTailHeight = 6;
const defaultOffset = 6;
const defaultOffsetBody = 0;
const getDefaultTransitionStyle = (entering) => ({
  opacity: entering ? 1 : 0,
  transitionProperty: "opacity",
});
const defaultStyle = {
  background: "#282828",
};
const defaultBoxStyle = {
  borderRadius: 4,
  padding: 8,
  color: "#fff",
};
const getTailHeight = (width) => width * 0.866;

const scrollRefPropType = PropTypes.oneOfType([
  PropTypes.instanceOf(Element),
  PropTypes.object,
]);

export const tooltipPropTypes = {
  position: PropTypes.oneOf([
    "top",
    "top-start",
    "top-end",
    "bottom",
    "bottom-start",
    "bottom-end",
    "left",
    "left-start",
    "left-end",
    "right",
    "right-start",
    "right-end",
  ]),
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
  autoFlip: PropTypes.bool,
  scrollRef: scrollRefPropType,
  scrollRefs: PropTypes.arrayOf(scrollRefPropType),
  listenToAllParentScrolls: PropTypes.bool,
};

export class Tooltip extends Component {
  static propTypes = {
    ...tooltipPropTypes,
    children: PropTypes.node.isRequired,
    sourceRef: PropTypes.instanceOf(Element),
    entering: PropTypes.bool,
    duration: PropTypes.number,
  };
  static defaultProps = {
    position: "top",
    getTransitionStyle: getDefaultTransitionStyle,
    style: defaultStyle,
    boxStyle: defaultBoxStyle,
    tailHeight: defaultTailHeight,
    offset: defaultOffset,
    offsetBody: defaultOffsetBody,
    portalId: null,
    pure: true,
    inline: false,
    interactive: false,
    autoFlip: true,
    listenToAllParentScrolls: false,
  };
  static scrollers = [];
  state = {
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    absoluteTop: 0,
    absoluteLeft: 0,
  };
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
  };
  scrollParents = [];
  throttling = false;
  unmounted = false;
  componentDidMount = () => {
    this.setPosition();
    this.findScrollParent();
  };
  componentWillUnmount = () => {
    this.unmounted = true;
    this.scrollParents.forEach((el) => {
      el.removeEventListener("scroll", this.onScroll);
    });
  };
  componentDidUpdate = (prevProps) => {
    const { sourceRef: prevSourceRef, portalId: prevPortalId } = prevProps;
    const {
      sourceRef,
      portalId,
      pure,
      inline,
      position,
      tailHeight,
      offset,
      offsetBody,
      autoFlip,
    } = this.props;
    if (
      !pure ||
      !shallowEqualForeignProps(this.props, prevProps, Tooltip.propTypes)
    ) {
      this.setPosition();
    } else {
      if (portalId !== prevPortalId) {
        this.setPortalRect();
      }
      if (sourceRef !== prevSourceRef) {
        this.setSourceRect();
        this.findScrollParent();
      }
      this.memoizedSetPosition(
        position,
        tailHeight,
        offset,
        offsetBody,
        inline || !portalId,
        this.sourceRect.top,
        this.sourceRect.left,
        this.sourceRect.width,
        this.sourceRect.height,
        this.tooltipRect.width,
        this.tooltipRect.height,
        this.portalRect.top,
        this.portalRect.left,
        this.portalRect.width,
        this.portalRect.height,
        autoFlip
      );
    }
  };

  setPosition = () => {
    const {
      inline,
      portalId,
      position,
      tailHeight,
      offset,
      offsetBody,
      autoFlip,
    } = this.props;
    const {
      top: sourceTop,
      left: sourceLeft,
      width: sourceWidth,
      height: sourceHeight,
    } = this.setSourceRect();
    const { width: tooltipWidth, height: tooltipHeight } =
      this.setTooltipRect();
    const {
      top: portalTop,
      left: portalLeft,
      width: portalWidth,
      height: portalHeight,
    } = this.setPortalRect();
    this.memoizedSetPosition(
      position,
      tailHeight,
      offset,
      offsetBody,
      inline || !portalId,
      sourceTop,
      sourceLeft,
      sourceWidth,
      sourceHeight,
      tooltipWidth,
      tooltipHeight,
      portalTop,
      portalLeft,
      portalWidth,
      portalHeight,
      autoFlip
    );
  };
  memoizedSetPosition = Memoize(
    (
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
      portalWidth,
      portalHeight,
      autoFlip
    ) => {
      const totalOffset = tailHeight + offset;
      let finalPosition = position;
      let { top, left } = this.getPosition(
        position,
        totalOffset,
        offsetBody,
        sourceTop,
        sourceLeft,
        sourceWidth,
        sourceHeight,
        tooltipWidth,
        tooltipHeight
      );
      if (autoFlip) {
        const splitPosition = position.split("-");
        let primaryPosition = splitPosition[0];
        const secondaryPosition = splitPosition[1];
        switch (primaryPosition) {
          case "left":
            if (left <= portalLeft) {
              primaryPosition = "right";
            }
            break;
          case "bottom":
            if (top + tooltipHeight >= portalTop + portalHeight) {
              primaryPosition = "top";
            }
            break;
          case "right":
            if (left + tooltipWidth >= portalLeft + portalWidth) {
              primaryPosition = "left";
            }
            break;
          default:
            if (top <= portalTop) {
              primaryPosition = "bottom";
            }
            break;
        }
        finalPosition = primaryPosition;
        if (secondaryPosition) {
          finalPosition += "-" + secondaryPosition;
        }
        if (finalPosition !== position) {
          ({ top, left } = this.getPosition(
            finalPosition,
            totalOffset,
            offsetBody,
            sourceTop,
            sourceLeft,
            sourceWidth,
            sourceHeight,
            tooltipWidth,
            tooltipHeight
          ));
        }
      }

      this.setState({
        top: top - portalTop - (inline ? sourceTop : 0),
        left: left - portalLeft - (inline ? sourceLeft : 0),
        absoluteTop: top,
        absoluteLeft: left,
        position: finalPosition,
      });
    }
  );
  getPosition = (
    position,
    totalOffset,
    offsetBody,

    sourceTop,
    sourceLeft,
    sourceWidth,
    sourceHeight,
    tooltipWidth,
    tooltipHeight
  ) => {
    let top = 0;
    let left = 0;
    switch (position) {
      case "left":
        top += (sourceHeight - tooltipHeight) / 2 + offsetBody;
        left -= tooltipWidth + totalOffset;
        break;
      case "left-start":
        top += offsetBody;
        left -= tooltipWidth + totalOffset;
        break;
      case "left-end":
        top += offsetBody - tooltipHeight + sourceHeight;
        left -= tooltipWidth + totalOffset;
        break;
      case "bottom":
        top += sourceHeight + totalOffset;
        left += (sourceWidth - tooltipWidth) / 2 + offsetBody;
        break;
      case "bottom-start":
        top += sourceHeight + totalOffset;
        left += offsetBody;
        break;
      case "bottom-end":
        top += sourceHeight + totalOffset;
        left += offsetBody - tooltipWidth + sourceWidth;
        break;
      case "right":
        top += (sourceHeight - tooltipHeight) / 2 + offsetBody;
        left += sourceWidth + totalOffset;
        break;
      case "right-start":
        top += offsetBody;
        left += sourceWidth + totalOffset;
        break;
      case "right-end":
        top += offsetBody - tooltipHeight + sourceHeight;
        left += sourceWidth + totalOffset;
        break;
      case "top-start":
        top -= tooltipHeight + totalOffset;
        left += offsetBody;
        break;
      case "top-end":
        top -= tooltipHeight + totalOffset;
        left += offsetBody - tooltipWidth + sourceWidth;
        break;
      default:
        top -= tooltipHeight + totalOffset;
        left += (sourceWidth - tooltipWidth) / 2 + offsetBody;
        break;
    }
    left += sourceLeft;
    top += sourceTop;
    return {
      top,
      left,
    };
  };
  setSourceRect = () => {
    const { sourceRef } = this.props;
    if (sourceRef) {
      this.sourceRect = (
        sourceRef.current || sourceRef
      ).getBoundingClientRect();
    }
    return this.sourceRect;
  };
  setTooltipRect = () => {
    if (this.tooltipRef.current) {
      this.tooltipRect = this.tooltipRef.current.getBoundingClientRect();
    }
    return this.tooltipRect;
  };
  setPortalRect = () => {
    const { portalId, inline } = this.props;
    if (portalId && !inline) {
      this.portalRect = document
        .getElementById(portalId)
        .getBoundingClientRect();
    }
    return this.portalRect;
  };
  findScrollParent = () => {
    const { sourceRef, scrollRef, scrollRefs, listenToAllParentScrolls } =
      this.props;
    let scrollParents = [];
    if (scrollRef) {
      scrollParents = [scrollRef.current || scrollRef];
    } else if (scrollRefs) {
      scrollParents = scrollRefs.map((ref) => ref.current || ref);
    } else {
      let el = sourceRef;
      while (el && el.parentNode && el.parentNode !== document) {
        el = el.parentNode;
        const style = getComputedStyle(el);
        if (
          style &&
          (style["overflow-y"] === "scroll" ||
            style["overflow-y"] === "auto" ||
            style["overflow-x"] === "scroll" ||
            style["overflow-x"] === "auto" ||
            style["overflow"] === "scroll" ||
            style["overflow"] === "auto")
        ) {
          scrollParents = [...scrollParents, el];
          if (!listenToAllParentScrolls) {
            break;
          }
        }
      }
      if (listenToAllParentScrolls) {
        scrollParents = [...scrollParents, window];
      }
    }
    scrollParents.forEach((el) => {
      if (el && !this.scrollParents.includes(el)) {
        el.addEventListener("scroll", this.onScroll);
        this.scrollParents.push(el);
      }
    });
  };
  onScroll = () => {
    if (!this.throttling) {
      this.throttling = true;
      this.setPosition();
      window.requestAnimationFrame(() => {
        if (this.unmounted) return;
        this.throttling = false;
      });
    }
  };
  getStyles = Memoize(
    (
      style,
      boxStyle,
      tailStyle,
      getTransitionStyle,
      entering,
      duration,
      position
    ) => {
      const {
        transition,
        transitionProperty,
        transitionDuration = `${duration}ms`,
        transitionTimingFunction = "ease-out",
        transitionDelay,

        transform,
        padding,
        opacity,

        ...rest
      } = {
        ...style,
        ...(getTransitionStyle &&
          getTransitionStyle(entering, duration, position)),
      };
      let transitionStyle = null;
      if (transition) {
        transitionStyle = { transition };
      } else if (transitionProperty) {
        transitionStyle = {
          transitionProperty,
          transitionDuration,
          transitionTimingFunction,
          transitionDelay,
        };
      }
      const mergedBoxStyle = {
        ...boxStyle,
        ...rest,
      };
      const mergedMaskStyle = Object.entries(mergedBoxStyle).reduce(
        (style, [key, value]) => {
          if (
            (!/^border/.test(key) &&
              !/^padding/.test(key) &&
              key !== "boxShadow") ||
            key === "borderRadius"
          ) {
            style[key] = value;
          }
          return style;
        },
        {}
      );
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
        },
      };
    }
  );

  getTooltipStyle = Memoize((top, left, interactive) => {
    return {
      position: "absolute",
      zIndex: 10,
      pointerEvents: !interactive && "none",
      top,
      left,
    };
  });

  getInteractiveStyle = Memoize(
    (
      position,
      tailHeight,
      offset,
      sourceWidth,
      sourceHeight,
      offsetWidth,
      offsetHeight
    ) => {
      const totalOffset = tailHeight + offset;
      let positionStyle = null;
      switch (position) {
        case "left":
        case "left-start":
        case "left-end":
          positionStyle = {
            right: -totalOffset,
            top: offsetHeight,
            width: totalOffset,
          };
          break;
        case "bottom":
        case "bottom-start":
        case "bottom-end":
          positionStyle = {
            top: -totalOffset,
            left: offsetWidth,
            height: totalOffset,
          };
          break;
        case "right":
        case "right-start":
        case "right-end":
          positionStyle = {
            left: -totalOffset,
            top: offsetHeight,
            width: totalOffset,
          };
          break;
        default:
          positionStyle = {
            bottom: -totalOffset,
            left: offsetWidth,
            height: totalOffset,
          };
          break;
      }
      return {
        position: "absolute",
        width: sourceWidth,
        height: sourceHeight,
        ...positionStyle,
      };
    }
  );

  getMaskStyle = Memoize((maskStyle) => {
    return {
      width: "100%",
      height: "100%",
      position: "absolute",
      zIndex: 1,
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      margin: "auto",
      ...maskStyle,
    };
  });

  getTailStyle = Memoize(
    (
      position,
      tailHeight,
      tailStyle,
      offsetBody,
      sourceWidth,
      sourceHeight,
      offsetWidth,
      offsetHeight
    ) => {
      const vertical = !(position === "right" || position === "left");
      const start = !(position === "bottom" || position === "right");
      const style = {
        width: tailHeight * 1.41,
        height: tailHeight * 1.41,
        position: "absolute",
        zIndex: 0,
        ...tailStyle,
      };
      switch (position) {
        case "right":
        case "right-start":
        case "right-end":
          return {
            top: sourceHeight / 2 + offsetHeight - offsetBody,
            bottom: 0,
            left: 0,
            transform: "translate(-50%, -50%) rotate(45deg)",
            ...style,
          };
        case "bottom":
        case "bottom-start":
        case "bottom-end":
          return {
            top: 0,
            right: 0,
            left: sourceWidth / 2 + offsetWidth - offsetBody,
            transform: "translate(-50%, -50%) rotate(45deg)",
            ...style,
          };
        case "left":
        case "left-start":
        case "left-end":
          return {
            top: sourceHeight / 2 + offsetHeight - offsetBody,
            right: 0,
            bottom: 0,
            transform: "translate(50%, -50%) rotate(45deg)",
            ...style,
          };
        default:
          return {
            right: 0,
            bottom: 0,
            left: sourceWidth / 2 + offsetWidth - offsetBody,
            transform: "translate(-50%, 50%) rotate(45deg)",
            ...style,
          };
      }
    }
  );
  getPortalElement = Memoize((portalId) => {
    const element = document.getElementById(portalId);
    if (!element && process.env.NODE_ENV !== "production") {
      throw new Error(
        `Could not find DOM element with ID ${portalId} to inject. Please provide a portalId which matches an existing DOM element or render a TooltipPortal as a parent to this element.`
      );
    }
    return element;
  });
  render = () => {
    const {
      children,
      portalId,
      inline,

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
    } = this.props;

    const { top, left, absoluteTop, absoluteLeft, position } = this.state;
    let element = null;
    if (!inline && portalId) {
      element = this.getPortalElement(portalId);
    }
    const { boxStyle, maskStyle, tailStyle } = this.getStyles(
      style,
      propBoxStyle,
      propTailStyle,
      getTransitionStyle,
      entering,
      duration,
      position
    );
    const {
      top: sourceTop,
      left: sourceLeft,
      width: sourceWidth,
      height: sourceHeight,
    } = this.sourceRect;
    const offsetWidth = sourceLeft - absoluteLeft;
    const offsetHeight = sourceTop - absoluteTop;
    const tooltip = (
      <div
        style={this.getTooltipStyle(top, left, interactive)}
        ref={this.tooltipRef}
      >
        {interactive && (
          <div
            style={this.getInteractiveStyle(
              position,
              tailHeight,
              offset,
              sourceWidth,
              sourceHeight,
              offsetWidth,
              offsetHeight
            )}
          />
        )}
        <div style={boxStyle} className={boxClassName}>
          <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
          {tailHeight > 0 && (
            <div
              style={this.getMaskStyle(maskStyle)}
              className={maskClassName}
            />
          )}
          {tailHeight > 0 && (
            <div
              style={this.getTailStyle(
                position,
                tailHeight,
                tailStyle,
                offsetBody,
                sourceWidth,
                sourceHeight,
                offsetWidth,
                offsetHeight
              )}
              className={tailClassName}
            />
          )}
        </div>
      </div>
    );
    return element ? createPortal(tooltip, element) : tooltip;
  };
}
