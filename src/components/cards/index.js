import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Card, Elevation, Icon, Button } from '@blueprintjs/core'
import clsx from 'classnames'
import posed, { PoseGroup } from 'react-pose'

import './styles.scss'


const CardBox = posed.div({
  open: {
    y: 0,
    opacity: 1,
    scaleY: 1,
    filter: 'blur(0px)',
    transition: {
      y: { type: 'spring', stiffness: 1000, damping: 25 },
      default: { duration: 200 },
    },
    applyAtStart: { display: 'block' },
  },
  closed: {
    y: -50,
    opacity: 0,
    filter: 'blur(10px)',
    scaleY: 1.2,
    transition: { duration: 200 },
    applyAtEnd: { display: 'none' },
  },
})


class BasicCard extends Component {
  render () {
    const cardClasses = clsx('np-card', 'np-basic-card', {
      info: this.props.info,
    })

    return (
      <Card interactive={true} elevation={Elevation.THREE} className={cardClasses}>
        {this.props.title && <h5>{this.props.title}</h5>}

        <div className='content'>
          {this.props.children}
        </div>
      </Card>
    )
  }
}

BasicCard.propTypes = {
  title: PropTypes.string,
  children: PropTypes.element.isRequired,
  info: PropTypes.bool,
}


class InteractiveCard extends Component {
  constructor (props) {
    super(props)

    this.state = {
      isOpen: props.isOpen || false,
    }

  }

  componentDidUpdate (prevProps) {
    if (this.props.isOpen !== prevProps.isOpen) {
      this.setState({ isOpen: this.props.isOpen })
    }
  }

  render () {
    return (
      <CardBox pose={this.state.isOpen ? 'open' : 'closed'}>

        <Card
          elevation={Elevation.FOUR}
          className={clsx('np-card', 'interactive', this.props.className)}>
          {this.props.children}
        </Card>

      </CardBox>
    )
  }
}

export { BasicCard, InteractiveCard }
