import React, { Component } from 'react'
import { Button, Popover, NonIdealState, Tag, MenuItem, FormGroup, Intent, Spinner, Icon } from '@blueprintjs/core'
import { Suggest } from '@blueprintjs/select'

import _ from 'lodash'

import Wiki from '~mixins/wikipedia'



class TagSuggest extends Component {
  constructor (props) {
    super(props)

    this.state = {
      query: '',
      items: [
        { id: 1, title: 'Root' },
        { id: 2, title: 'Noot' },
        { id: 3, title: 'Boot' },
        { id: 4, title: 'Boop' },
        { id: 5, title: 'Doop' },
      ],
    }

    this.queryDidChange = this.queryDidChange.bind(this)
  }

  componentDidMount () {
  }

  queryDidChange (q, event) {
    this.setState({ inflight: true })

    Wiki.opensearch(q).then((items) => {
      if (items.length >= 1) {
        this.setState({ items, inflight: false })
      } else {
        this.setState({ items: [], inflight: false})
      }
    })
  }

  itemRenderer (item, { modifiers, index, query, handleClick }) {
    return (
      <div key={item.id}>
        <Tag
          interactive
          active={modifiers.active}
          onClick={handleClick}
          intent={modifiers.active ? Intent.PRIMARY : Intent.DEFAULT }>
          {item.title}
        </Tag>
      </div>
    )
  }

  getInputProps () {
    // Return props and loading element for `Input`
    let inflightSpinner

    if (this.state.inflight) {
      inflightSpinner = <Spinner intent={Intent.PRIMARY}/>
    } else {
      inflightSpinner = <Icon icon='blank'/>
    }

    return {
      leftIcon: 'search',
      rightElement: inflightSpinner,
    }
  }

  render () {
    return (
      <Suggest
        items={this.state.items}
        inputProps={this.getInputProps()}
        inputValueRenderer={(item) => item.title}
        itemRenderer={this.itemRenderer}
        itemPredicate={(query, item) => true}
        onItemSelect={(item) => console.log(item)}
        onQueryChange={this.queryDidChange}
        noResults={<NonIdealState title='No Matches' icon='offline'
        popoverProps={{ minimal: true }}/>}
      />

    )
  }
}


export { TagSuggest }
