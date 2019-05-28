import React, { Component } from 'react'
import { Button, ControlGroup, NonIdealState, Tag, Intent } from '@blueprintjs/core'
import { Suggest } from '@blueprintjs/select'
import posed from 'react-pose'
import Fuse from 'fuse.js'

import Wiki from '~mixins/wikipedia'

import './suggest.sass'


const SuggestedTag = posed(Tag)({
  open: { opacity: 1 },
  closed: { opacity: 0 },
})

const reFuse = (items, keys) => {
  const options = {
    shouldSort: true,
    threshold: .5,
    keys,
  }
  return new Fuse(items, options)
}


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

    Wiki.opensearch(q, this.props.lang).then((items) => {
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
    this.props.onSelect({ weight: 1, lang: this.props.lang, ...item })
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

  itemListPredicate (query, items) {
    const fuse = reFuse(items, [ 'title' ])
    return fuse.search(query)
  }

  render () {
    const popoverProps = {
      position: 'bottom-right',
      className: 'np--tags-popover',
      popoverClassName: 'concept-popover',
      modifiers: {
        arrow: { enabled: true },
        flip: { enabled: true },
      },
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
          itemListPredicate={this.itemListPredicate}
          onItemSelect={this.didSelectItem}
          onQueryChange={this.queryDidChange}
          noResults={this.renderEmptyState()}
          selectedItem={null}
          resetOnSelect
          resetOnClose
          popoverProps={popoverProps}
        />
      </ControlGroup>
    )
  }
}


export default TagSuggest
