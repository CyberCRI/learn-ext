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

  componentDidMount () {
    // Once the component mounts, we'll request the server for tags/concepts.
    RootAPI
      .fetchConcepts(this.state.pageUrl)
      .then((data) => {
        const concepts = List(data.concepts)
        this.setState({
          concepts,
          selected: concepts,
        })
      })
      .then(() => {
        // Now we make another call to the server with fake user "nuggets" to
        // add the data to ilearn.
        RootAPI.learn({
          url: this.state.pageUrl,
          concepts: this.state.selected.toJS(),
          username: 'Nuggets',    // [XXX] Fix this to be configurable.
          knowledge_progression: 0.5,
          title: document.title,
        }).then(() => {
          this.setState({ learned: true, inflight: false, errored: false })
        }).fail(() => {
          this.setState({ inflight: false, errored: true })
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
    const tag = this.state.concepts.find((i) => i.label === value)

    this.setState({ selected, inflight: true }, () => {
      RootAPI.crowdSourcing({
        ressource_url: this.state.pageUrl,
        concept_title: tag.label,
        reliability_variation: -1,
      }).then(() => {
        this.setState({ inflight: false, errored: false })
      }).fail(() => {
        this.setState({ inflight: false, errored: true })
      })
    })

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