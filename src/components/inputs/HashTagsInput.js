import React, { useState } from 'react'
import _ from 'lodash'
import { MenuItem } from '@blueprintjs/core'
import { MultiSelect } from '@blueprintjs/select'


export const HashTagsInput = (props) => {
  const [ query, setQuery ] = useState('')
  const [ selectedTags, setSelectedTags ] = useState(props.value || [])
  const tags = props.choices || []

  React.useEffect(() => {
    props.onChange(selectedTags)
  }, [selectedTags])

  const itemRenderer = (tag, { modifiers, handleClick }) => {
    if (!modifiers.matchesPredicate) {
      return null
    }
    return (
      <MenuItem
        active={modifiers.active}
        key={tag.id}
        onClick={handleClick}
        text={`${tag.label}`}
        shouldDismissPopover={false}
      />)
  }
  const createNewTagRenderer = (q, active, handleClick) => {
    return <MenuItem
      icon='add'
      text={`Create "${q}"`}
      active={active}
      onClick={handleClick}
      shouldDismissPopover={false}/>
  }
  const createNewItemFromQuery = (query) => {
    return { id: query, label: query }
  }
  const itemPredicate = (query, tag) => {
    return tag.label.indexOf(query) >= 0
  }
  const onTagRemove = (value) => {
    const newSelection = _.reject(selectedTags, ['label', value])
    setSelectedTags(newSelection)
  }
  const onItemSelect = (tag) => {
    const newSelection = _.unionBy(selectedTags, [tag], 'label')
    setSelectedTags(newSelection)
    setQuery('')
  }

  return <div className='hashtag-input'>
    <MultiSelect
      onItemSelect={onItemSelect}
      onQueryChange={q => setQuery(q)}

      itemRenderer={itemRenderer}
      itemPredicate={itemPredicate}
      tagRenderer={tag => `${tag.label}`}

      query={query}
      items={tags.map(i => ({ id: i, label: i }))}
      selectedItems={selectedTags}

      allowCreate={true}
      createNewItemRenderer={createNewTagRenderer}
      createNewItemFromQuery={createNewItemFromQuery}

      initialContent={tags.length ? undefined : <p>Type to create a hashtag.</p>}

      fill={true}
      placeholder='Search or Add Hashtags'

      popoverProps={{ minimal: true, portalClassName: 'hashtag-portal' }}
      tagInputProps={{
        onRemove: onTagRemove,
        tagProps: {
          minimal: true,
          round: true,
          intent: 'primary',
        },
      }}
    />
  </div>
}
