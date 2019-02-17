import React, { Component } from 'react'
import { Button, ControlGroup, NonIdealState, Tag, Intent, Spinner, Icon } from '@blueprintjs/core'
import { Suggest } from '@blueprintjs/select'
import { hot } from 'react-hot-loader'
import posed, { PoseGroup } from 'react-pose'


import Wiki from '~mixins/wikipedia'

import './suggest.sass'


const SuggestedTag = posed(Tag)({
  open: { opacity: 1 },
  closed: { opacity: 0 },
})


class TagSuggest extends Component {
  constructor (props) {
    super(props)

    this.state = {
      query: '',
      items: props.items || [],
    }
    this.inputFieldRef = React.createRef()

    this.queryDidChange = this.queryDidChange.bind(this)
    this.shouldFocusInput = this.shouldFocusInput.bind(this)
    this.didSelectItem = this.didSelectItem.bind(this)
  }

  componentDidMount () {
  }

  queryDidChange (q, event) {
    this.setState({ query: q })
    if (q.length <= 2) {
      this.setState({ waiting: true })
      return
    }
    this.setState({ inflight: true, waiting: false })

    Wiki.opensearch(q).then((items) => {
      if (items.length >= 1) {
        this.setState({ items, inflight: false })
      } else {
        this.setState({ items: [], inflight: false})
      }
    })
  }

  didSelectItem (item) {
    this.setState({ selected: item, query: '' })
    // Publish to the parent component
    this.props.onSelect({ label: item.title, weight: 1, ...item })
  }

  shouldFocusInput () {
    if (this.inputFieldRef) {
      this.inputFieldRef.focus()
    }
  }

  itemRenderer (item, { modifiers, index, query, handleClick }) {
    return (
      <div key={item.title}>
        <Tag
          interactive
          large
          minimal
          active={modifiers.active}
          onClick={handleClick}
          intent={modifiers.active ? Intent.PRIMARY : Intent.DEFAULT }>
          {item.title}
        </Tag>
      </div>
    )
  }

  renderEmptyState () {
    return (
      <NonIdealState
        title='Type to find concepts.'
        icon='path-search'
        description='We will suggest relevant concepts to tag this resource with.'
        className='np--tags-non-ideal'
      />
    )
  }

  render () {
    const popoverProps = {
      position: 'bottom',
      usePortal: false,
      className: 'np--tags-popover',
      modifiers: {
        arrow: { enabled: false },
        flip: { enabled: false },
      }
    }
    const inputFieldProps = {
      className: 'np--input-tags-field',
      placeholder: 'Add Concept',
      inputRef: (r) => {
        this.inputFieldRef = r
      },
    }

    return (
      <ControlGroup className='np--tag-suggest'>
        <Button icon='plus' minimal onClick={this.shouldFocusInput} />
        <Suggest
          items={this.state.items}
          inputProps={inputFieldProps}
          inputValueRenderer={(item) => item.title}
          itemRenderer={this.itemRenderer}
          itemPredicate={(query, item) => true}
          onItemSelect={this.didSelectItem}
          onQueryChange={this.queryDidChange}
          noResults={this.renderEmptyState()}
          selectedItem={null}
          resetOnSelect
          popoverProps={popoverProps}
        />
        <Button icon='blank' minimal onClick={this.shouldFocusInput} loading={this.state.inflight}/>
      </ControlGroup>
    )
  }
}


export default hot(module)(TagSuggest)
