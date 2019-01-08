import React, { Component } from 'react'
import { CSSTransition } from 'react-transition-group'
import { List } from 'immutable'
import { Button, NonIdealState, Tag, MenuItem, FormGroup, Intent, Icon, Spinner } from '@blueprintjs/core'
import { MultiSelect } from '@blueprintjs/select'


import { getCanonicalUrl } from '~mixins/utils'
import RootAPI from '~mixins/root-api'



class ConceptsField extends Component {
  constructor (props) {
    super(props)

    this.state = {
      pageUrl: getCanonicalUrl(),
      concepts: List(),
      selected: List(),
      inflight: true,
      learned: false,
      errored: false,
      ...props.value,
    }

    this.didSelectOption = this.didSelectOption.bind(this)
    this.didRemoveTag = this.didRemoveTag.bind(this)
    this.isSelected = this.isSelected.bind(this)
    this.renderOption = this.renderOption.bind(this)
    this.renderRightElement = this.renderRightElement.bind(this)
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
