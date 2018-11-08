import React, { Component } from 'react'
import { List } from 'immutable'
import { hot } from 'react-hot-loader'

import { Button, Popover, NonIdealState, Tag, MenuItem, FormGroup, Intent } from '@blueprintjs/core'
import { MultiSelect } from '@blueprintjs/select'


import { get_concepts } from './remote'
import './popout.sass'


class ConceptsField extends Component {
  constructor (props) {
    super(props)

    this.state = {
      keywords: List(),
      concepts: List(),
      selected: List(),
    }
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
    return this.state.selected.indexOf(item) !== -1
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

  renderOption (item) {
    const active = this.state.selected.find((x) => x.label === item.label)
    return (
      <MenuItem
        key={item.label}
        text={item.label}
        shouldDismissPopover={false}
        icon={active ? 'tick' : 'blank'}
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
              minimal: true,
            }
          }}
          items={this.state.concepts.toJS()}
          selectedItems={this.state.selected}
          tagRenderer={(x) => x.label}
          onItemSelect={(x) => {
            const selected = [...this.state.selected, x]
            this.setState({ selected })
          }}
          itemRenderer={(x) => this.renderOption(x)}
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
            <ConceptsField />
          </div>
        </Popover>
      </div>
    )
  }
}

export default hot(module)(Popout)
