import React, { Component } from 'react'
import { List } from 'immutable'
import { hot } from 'react-hot-loader'
import autoBind from 'react-autobind'

import { Button, Popover, NonIdealState, Tag, MenuItem, FormGroup, Intent } from '@blueprintjs/core'
import { MultiSelect } from '@blueprintjs/select'


import { get_concepts } from './remote'
import './popout.sass'


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
    get_concepts().then((data) => {
      const keywords = List(data.keywords)
      const concepts = List(data.concepts)
      this.setState({
        keywords,
        concepts,
        selected: concepts.slice(1),
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

  didRemoveTag (event, tag) {
    const selected = this.state.selected.filterNot((i) => i.label === tag.children)
    this.setState({ selected })
  }

  renderTag (item) {
    return (
      <Tag
        className='bp3-skeleton'
        key={item.label}
        intent={Intent.PRIMARY}
        interactive
        minimal>
        {item.label}
      </Tag>
    )
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
            // leftIcon: 'tag',
            fill: true,
            large: true,
            rightElement: <Button icon='plus' minimal/>,
            tagProps: {
              interactive: true,
              onRemove: this.didRemoveTag,
              minimal: true,
            }
          }}
          popoverProps={{
            position: 'bottom-left',

          }}
          openOnKeyDown
          items={this.state.concepts.toJS()}
          selectedItems={this.state.selected}
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
        <Popover position='left-top' defaultIsOpen>
          <Button icon='book' />
          <div className='ext popover'>
            <h2>iLearn</h2>
            <Button icon='endorsed' intent={Intent.PRIMARY}>Milestone</Button>
            <ConceptsField />
          </div>
        </Popover>
      </div>
    )
  }
}

export default hot(module)(Popout)
