import React, { Component } from 'react'
import { List } from 'immutable'
import { hot } from 'react-hot-loader'
import autoBind from 'react-autobind'

import { Button, Popover, NonIdealState, Tag, MenuItem, FormGroup, Intent } from '@blueprintjs/core'
import { Slider, Overlay, Card, Elevation } from '@blueprintjs/core'
import { MultiSelect } from '@blueprintjs/select'


import { get_concepts } from '~mixins/remote'
import TagSuggest from '~components/input/tag-suggest'
import { BasicCard, InteractiveCard } from '~components/cards'
import ConceptsField from '~components/input/concepts'

import './popout.sass'
import './card.scss'


class OptionsList {
  constructor (data) {
  }

}


class Popout extends Component {
  constructor (props) {
    super(props)
    this.state = {
      ...props.value,
    }
  }

  render () {
    return (
      <div className='ext--root'>
        <Popover position='left-top'>
          <Button icon='books' />
          <div className='ext popover'>
            <h2>iLearn</h2>
            <Button icon='endorsed' intent={Intent.PRIMARY}></Button>
            <ConceptsField />

            <Slider
              min={0}
              max={3}
              vertical
              labelRenderer={(x) => ['Irrelevant', 'Easy', 'Medium', 'Difficult'][x]}
            />
          </div>
        </Popover>
      </div>
    )
  }
}

class ActionCard extends Component {
  constructor (props) {
    super(props)

    this.state = {
      isOpen: false,
    }
  }

  componentDidMount () {
    browser.runtime.onMessage.addListener((message, sender, respond) => {
      if (message.activate) {
        this.setState({ isOpen: true })
        console.log(message, sender)
      }
    })
  }

  render () {
    return (
      <Overlay
        hasBackdrop={false}
        isOpen={this.state.isOpen}
        usePortal={true}
        className='np-ext--card'
        transitionName='np-ext--card-transition'>

        <InteractiveCard>
          <h5>iLearn</h5>
          <ConceptsField />
          <TagSuggest />
        </InteractiveCard>

      </Overlay>

    )
  }
}

export { ActionCard }

export default hot(module)(Popout)
