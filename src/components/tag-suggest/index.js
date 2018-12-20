import React, { Component } from 'react'
import { Button, Popover, NonIdealState, Tag, MenuItem, FormGroup, Intent, Spinner, Icon } from '@blueprintjs/core'
import { Suggest } from '@blueprintjs/select'
import { hot } from 'react-hot-loader'
import posed, { PoseGroup } from 'react-pose'

import _ from 'lodash'

import Wiki from '~mixins/wikipedia'


const SuggestedTag = posed(Tag)({
  open: { opacity: 1 },
  closed: { opacity: 0 },
})


class TagSuggest extends Component {
  constructor (props) {
    super(props)

    this.state = {
      query: '',
      items: [],
    }

    this.queryDidChange = this.queryDidChange.bind(this)
  }

  componentDidMount () {
  }

  queryDidChange (q, event) {
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
      inflightSpinner = <Spinner intent={Intent.PRIMARY} size={Spinner.SIZE_SMALL}/>
    } else {
      inflightSpinner = <Icon icon={this.state.waiting ? 'more' : 'blank'}/>
    }

    return {
      rightElement: inflightSpinner,

    }
  }

  renderEmptyState () {
    return (
      <NonIdealState
        title='Type to find concepts.'
        icon='path-search'
        description='We will suggest relevant concepts to tag this resource with as you type.'
        className='np--tags-non-ideal'
      />
    )
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
        noResults={this.renderEmptyState()}
        popoverProps={{ minimal: true, position: 'bottom' }}
      />
    )
  }
}


export default hot(module)(TagSuggest)
