import React, { Component } from 'react'
import { List } from 'immutable'
import { hot } from 'react-hot-loader'
import autoBind from 'react-autobind'

import { Button, Popover, NonIdealState, Tag, MenuItem, FormGroup, Intent } from '@blueprintjs/core'
import { Slider } from '@blueprintjs/core'
import { MultiSelect } from '@blueprintjs/select'



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
            rightElement: <Button icon='plus' minimal />,
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