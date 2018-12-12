import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Card, Elevation, Icon, Button } from '@blueprintjs/core'
import clsx from 'classnames'

import './styles.scss'


class BasicCard extends Component {
  render () {
    const cardClasses = clsx('np-card', {
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
  render () {
    const cardClasses = clsx('np-card', 'np-card-down', 'interactive', {
      info: this.props.info,
    })

    return (
      <Card interactive={true} elevation={Elevation.THREE} className={cardClasses}>
        <header><Icon icon='book' className='icon-float'/></header>
        <main>{this.props.children}</main>
        <footer><Button icon='chevron-down' intent='primary'>DIFFICULT!</Button></footer>
      </Card>
    )
  }
}

export { BasicCard, InteractiveCard }
