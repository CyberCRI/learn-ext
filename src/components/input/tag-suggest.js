import React, { Component } from 'react'
import { Button, Popover, NonIdealState, Tag, MenuItem, FormGroup, Intent } from '@blueprintjs/core'
import { Suggest } from '@blueprintjs/select'


class TagSuggest extends Component {
  constructor (props) {
    super(props)

    this.state = {
      items: [
        { label: 'Root' },
        { label: 'Noot' },
        { label: 'Boot' },
        { label: 'Boop' },
        { label: 'Doop' },
      ],
    }
  }

  itemRenderer (item, { modifiers, index, query, handleClick }) {
    return (
      <div>
        <Tag
          interactive
          active={modifiers.active}
          onClick={handleClick}
          intent={modifiers.active ? Intent.PRIMARY : Intent.DEFAULT }>
          {item.label}
        </Tag>
      </div>
    )
  }

  render () {
    return (
      <Suggest
        items={this.state.items}
        inputValueRenderer={(item) => item.label}
        itemRenderer={this.itemRenderer}
        itemPredicate={(query, item) => item.label.includes(query)}
        onItemSelect={(item) => console.log(item)}
        noResults={<NonIdealState title='No Matches' icon='offline'
        popoverProps={{ minimal: true }}/>}
      />

    )
  }
}


export { TagSuggest }
