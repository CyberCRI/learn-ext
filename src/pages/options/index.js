import React, { Component } from 'react'
import { Card, Elevation, Icon, Button, Popover, Menu, MenuItem, Tag } from '@blueprintjs/core'
import posed, { PoseGroup } from 'react-pose'
import clsx from 'classnames'
import { renderReactComponent } from '~mixins/utils'
import { request } from '~mixins'


import './_options.sass'

import { InteractiveCard } from '~components/cards'
class MapCard extends Component {
  constructor (props) {
    super(props)
    this.state = {
      pose: 'init',
      atlasReady: false,
      fakeTags: [],
    }

  }
  componentDidMount () {
  }
  render () {
    return (
    )
  }
}

window.addEventListener('load', () => {
  // const mountroot = document.getElementById('cartography')
  renderReactComponent('cartography', MapCard)
})

