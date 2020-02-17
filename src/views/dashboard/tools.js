import React, { useRef, useState } from 'react'
import { useToggle, useUpdateEffect, useKey, useLogger, useDebounce } from 'react-use'

import { InputGroup, Button, ButtonGroup } from '@blueprintjs/core'
import { i18n } from '@ilearn/modules/i18n'

const i18nT = i18n.context('pages.dashboard')

const SortOrderButton = ({ downwards=true, onToggle, ...props }) => {
  return (
    <Button
      text={i18nT('actions.sort')}
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

  useDebounce(() => {
    onChange && onChange({ query })
  }, 400, [ query ])

  return (
    <div className='omnibar'>
      <InputGroup
        value={query}
        onChange={queryDidChange}
        inputRef={boxRef}
        placeholder={i18nT('searchInput.placeholder')}
        leftIcon='search'
        rightElement={<SearchButton/>}
        large/>
    </div>
  )
}
