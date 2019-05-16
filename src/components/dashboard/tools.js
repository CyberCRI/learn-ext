import React, { useRef, useState } from 'react'
import { useToggle, useUpdateEffect, useKey, useLogger } from 'react-use'

import { InputGroup, Button, ButtonGroup, ControlGroup } from '@blueprintjs/core'


const SortOrderButton = ({ downwards=true, onToggle, ...props }) => {
  return (
    <Button
      text='Sort'
      icon={downwards ? 'sort-desc' : 'sort-asc'}
      onClick={onToggle}
      {...props}/>
  )
}


export const FilterTools = ({ onChange }) => {
  const [ sortOrder, toggleSortOrder ] = useToggle(true)

  useUpdateEffect(() => {
    onChange && onChange({ sortOrder })
  })

  return (
    <ButtonGroup>
      <SortOrderButton downwards={sortOrder} onToggle={toggleSortOrder}/>
    </ButtonGroup>
  )
}

export const SearchButton = (props) => {
  return (
    <Button
      icon='arrow-right'
      intent='primary'
      {...props}/>
  )
}


export const OmniBar = ({ onChange }) => {
  const [ query, setQuery ] = useState('')
  const boxRef = useRef(null)
  const focusOmnibox = (event) => {
    boxRef.current.focus()
  }
  useKey('S', focusOmnibox, { event: 'keyup' })
  useLogger('OmniBar')

  const queryDidChange = (event) => {
    setQuery(event.target.value)
  }

  useUpdateEffect(() => {
    onChange && onChange({ query })
  }, [ query ])

  return (
    <div role='omnibar'>
      <InputGroup
        value={query}
        onChange={queryDidChange}
        inputRef={boxRef}
        placeholder='Search'
        leftIcon='search'
        rightElement={<SearchButton/>}
        large/>
    </div>
  )
}
