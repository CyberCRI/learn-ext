import React, { Component } from 'react'
import { List } from 'immutable'
import { hot } from 'react-hot-loader'
import autoBind from 'react-autobind'

import { Button, Popover, NonIdealState, Tag, MenuItem, FormGroup, Intent } from '@blueprintjs/core'
import { Slider, Overlay, Card, Elevation } from '@blueprintjs/core'
import { MultiSelect } from '@blueprintjs/select'


import { get_concepts } from '~mixins/remote'
import TagSuggest from '~components/input/tag-suggest'

import './popout.sass'
import './card.scss'


class OptionsList {
  constructor (data) {
  }

}


class ConceptsField extends Component {
  constructor (props) {
    super(props)

    this.state = {
      keywords: List(),
      concepts: List(),
      selected: List(),
    }
    autoBind(this)
    this.didSelectOption = this.didSelectOption.bind(this)
    this.didRemoveTag = this.didRemoveTag.bind(this)
    this.isSelected = this.isSelected.bind(this)
  }

  componentDidMount () {
    // Once the component mounts, we'll request the server for tags/concepts.
    get_concepts().then((data) => {
      const keywords = List(data.keywords)
      const concepts = List(data.concepts)
      this.setState({
        keywords,
        concepts,
        selected: concepts.slice(2),
      })

    })
  }

  isSelected (item) {
    return this.state.selected.filter((i) => i.label === item.label).size === 1
  }

  didSelectOption (item, event) {
    let selected
    if (this.isSelected(item)) {
      // Deselect this item.
      selected = this.state.selected.filterNot((i) => i.label === item.label)
    } else {
      selected = this.state.selected.push(item)
    }
    this.setState({ selected })
  }

  didRemoveTag (value, index) {
    // Handle tag removal
    // Filters the `selected` state container to remove the tags
    const selected = this.state.selected.filterNot((i) => i.label === value)
    this.setState({ selected })
  }

  renderOption (item, { modifiers, handleClick }) {
    return (
      <MenuItem
        key={item.label}
        text={item.label}
        shouldDismissPopover={false}
        onClick={handleClick}
        active={modifiers.active}
        icon={this.isSelected(item) ? 'tick' : 'blank'}
      />)
  }

  render () {
    return (
      <FormGroup
        helperText='Add or update tags'
        label='Keywords'>

        <MultiSelect
          tagInputProps={{
            fill: true,
            large: true,
            rightElement: <Button icon='plus' minimal onClick={() => this.tagInputRef.setState({ isOpen: true })} />,
            ref: (r) => this.tagInputRef = r,
            onRemove: this.didRemoveTag,
            tagProps: {
              interactive: true,
              minimal: true,
            }
          }}
          popoverProps={{
            position: 'bottom-left',

          }}
          openOnKeyDown
          items={this.state.concepts.toJS()}
          selectedItems={this.state.selected.toJS()}
          tagRenderer={(x) => x.label}
          onItemSelect={this.didSelectOption}
          itemRenderer={this.renderOption}
        />
      </FormGroup>
    )
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
          <Button icon='book' />
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
        hasBackdrop={true}
        isOpen={this.state.isOpen}
        usePortal={true}
        className='np-ext--card'
        transitionName='np-ext--card-transition'>

        <Card elevation={Elevation.THREE} className='np-ext--card'>
          <h5>iLearn</h5>
          <ConceptsField />
          <TagSuggest />
        </Card>

      </Overlay>

    )
  }
}

export { ActionCard }

export default hot(module)(Popout)
