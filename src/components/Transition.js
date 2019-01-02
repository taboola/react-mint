import React, { Component } from 'react';

export class Transition extends Component {
  state = {
    entering: false,
    mounted: false,
  }
  timer = null;
  timestamp = 0;
  prevTimeout = 0;

  componentDidMount = () => {
    const { enter, timeout } = this.props
    this.prevTimeout = timeout;
    enter && this.enter()
  }
  componentWillUnmount = () => this.stopTimer()

  componentDidUpdate = ({ enter : prevEnter }) => {
    const { enter } = this.props
    enter != prevEnter && (enter ? this.enter() : this.exit())
  }
  enter = () => {
    this.setState({ entering: true, mounted: true})
    this.startTimer(null)
  }

  exit = () => this.setState({entering: false}, () => this.startTimer(this.exited))
  exited = () => this.setState({ mounted: false})

  startTimer = (timer) => {
    const { timeout } = this.props
    let delta = this.prevTimeout - (Date.now() - this.timestamp)
    if(delta < 0) {
      delta = 0;
    }
    let newTimeout = timeout - delta;
    this.prevTimeout = newTimeout !== timeout ? newTimeout : timeout
    this.timestamp = Date.now();
    clearTimeout(this.timer);
    this.timer = setTimeout(timer, newTimeout)
  }
  stopTimer = () => {
    clearTimeout(this.timer);
    this.timer = null;
  }

  render = () => {
    const {
      children,
      enter
    } = this.props
    const {
      entering,
      mounted
    } = this.state
    return (enter || mounted) && children(entering)
  }
}