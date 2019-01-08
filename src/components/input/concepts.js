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
    this.renderTag = this.renderTag.bind(this)
  }

  componentDidUpdate (prevProps) {
    if (this.props.concepts !== prevProps.concepts) {
      this.setState({ concepts: this.props.concepts })
    }
  }

  isSelected (item) {
    return this.state.selected.filter((i) => i.label === item.label).size === 1
  }

  didRemoveTag (item) {
    // Handle tag removal
    // Filters the `selected` state container to remove the tags
    const concepts = this.state.concepts.filterNot((i) => i.label === item.label)

    this.setState({ concepts }, () => this.props.onRemove(item, concepts))
  }

  renderTag (item) {
    return (
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
      <ul data-role='concepts-input' className='np--concepts-list'>
        <PoseGroup animateOnMount>
          {this.state.concepts.map(this.renderTag)}
        </PoseGroup>
      </ul>
    )
  }
}

export default ConceptsField
