import React, { useRef, useState } from 'react'
import { useToggle, useUpdateEffect, useKey, useLogger } from 'react-use'

import { InputGroup, Button, ButtonGroup, ControlGroup } from '@blueprintjs/core'


const SortOrderButton = ({ downwards=true, onToggle, ...props }) => {
  const [ desc, toggleOrder ] = useToggle(downwards)

  useUpdateEffect(() => {
    onToggle && onToggle(desc)
  })

  return (
    <Button
      text='Sort'
      icon={desc ? 'sort-desc' : 'sort-asc'}
      onClick={() => toggleOrder()}
      {...props}/>
  )
}


export const FilterTools = (props) => {
  return (
    <ButtonGroup>
      <SortOrderButton/>
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


export const OmniBar = () => {
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
