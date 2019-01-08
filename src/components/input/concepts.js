import React, { Component } from 'react'
import { List } from 'immutable'
import { Button, NonIdealState, Tag, MenuItem, FormGroup, Intent, Icon, Spinner } from '@blueprintjs/core'
import posed, { PoseGroup } from 'react-pose'


const FluidTag = posed.li()


class ConceptsField extends Component {
  constructor (props) {
    super(props)

    this.state = {
      concepts: props.concepts,
    }

    this.didRemoveTag = this.didRemoveTag.bind(this)
    this.isSelected = this.isSelected.bind(this)
    this.renderRightElement = this.renderRightElement.bind(this)
    this.renderTag = this.renderTag.bind(this)
  }

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

  didRemoveTag (item) {
    // Handle tag removal
    // Filters the `selected` state container to remove the tags
    const concepts = this.state.concepts.filterNot((i) => i.label === item.label)

    this.setState({ concepts }, () => this.props.onRemove(item, concepts))
  }

  renderTag (item) {
    return (
  }

  renderRightElement () {
    if (this.state.inflight) {
      return <Spinner intent={Intent.PRIMARY} size={24} />
    } else if (this.state.errored) {
      return <Icon icon='offline' size={24} intent={Intent.DANGER} />
    }
    if (this.state.learned) {
      return <Icon icon='automatic-updates' size={24} intent={Intent.SUCCESS} />
    }
    return <Icon icon='blank' />
      <FluidTag key={item.label}>
        <Tag
          interactive
          minimal
          large
          className='np--concept-tag'
          onRemove={() => this.didRemoveTag(item)}>
          {item.label}
        </Tag>
      </FluidTag>
    )
  }

  render () {
    return (
      <div data-role='concepts-input' className='np--input-concepts'>
        <div>{this.renderRightElement()}</div>

        <MultiSelect
          tagInputProps={{
            fill: true,
            large: true,
            ref: (r) => this.tagInputRef = r,
            onRemove: this.didRemoveTag,
            tagProps: {
              interactive: true,
              minimal: true,
            },
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
      </div>
    )
  }
}

export default ConceptsField
