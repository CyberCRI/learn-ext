import React, { useState } from 'react'
import { useDebounce, useBoolean } from 'react-use'
import { Tag, Card, NonIdealState, Spinner } from '@blueprintjs/core'
import { Select } from '@blueprintjs/select'
import clsx from 'classnames'

import { reFuse } from '~mixins/itertools'
import Wiki from '~mixins/wikipedia'
import { i18n } from '@ilearn/modules/i18n'

const i18nT = i18n.context('components.suggest')

const conceptPredicate = (query, items) => {
  if (query) {
    return reFuse(items, [ 'title' ]).search(query)
  }
  return items
}

const renderSuggestion = (item, { modifiers, handleClick }) => {
  if (!modifiers.matchesPredicate) {
    return null
  }
  const itemClasses = clsx('suggestion', { active: modifiers.active })

  return (
    <div key={item.title} className={itemClasses} onClick={handleClick}>
      <p><strong>{item.title}</strong> {item.description}</p>
    </div>
  )
}

const EmptyStatePlaceholder = () => {
  return (
    <NonIdealState
      title={i18nT('intro.title')}
      icon='path-search'
      description={i18nT('intro.description')}
      className='np--tags-non-ideal'/>
  )
}

const ZeroResultsState = ({ loading, query }) => {
  let props = {}
  if (loading) {
    props = {
      title: i18nT('inflight.label'),
      icon: <Spinner/>,
    }
  } else if (query.length < 3) {
    return <EmptyStatePlaceholder/>
  } else {
    props = {
      title: i18nT('error.title'),
      description: i18nT('error.description', { query }),
    }
  }
  return <NonIdealState {...props}/>
}

const controlProps = {
  input: {
    placeholder: i18nT('searchInput.placeholder'),
    className: 'suggest input',
    minimal: true,
  },
  popover: {
    position: 'left',
    minimal: false,
    className: 'suggest target',
    portalClassName: 'suggest popover',
    modifiers: {
      arrow: { enabled: true },
      flip: { enabled: true },
    },
  },
}

export const ConceptSuggest = ({ onSelect, lang }) => {
  const [ query, setQuery ] = useState('')
  const [ items, setItems ] = useState([])
  const [ loading, setLoadingState ] = useBoolean(false)

  const didSelectItem = (item) => {
    onSelect({ weight: 1, ...item })
  }

  useDebounce(() => {
    if (query.length < 3) {
      // Yo man! Please type more stuff.
      setItems([])
      return
    }
    setLoadingState(true)
    Wiki
      .opensearch(query, lang)
      .then((data) => {
        setItems(data)
        setLoadingState(false)
      })
      .fail(() => {
        setLoadingState(false)
      })
  }, 300, [ query ])

  return (
    <div className='suggest root'>
      <Select
        filterable
        resetOnClose
        resetOnSelect
        itemListPredicate={conceptPredicate}
        itemRenderer={renderSuggestion}
        items={items}

        inputProps={({...controlProps.input, loading})}
        popoverProps={controlProps.popover}

        noResults={<ZeroResultsState loading={loading} query={query}/>}
        initialContent={<EmptyStatePlaceholder/>}

        query={query}
        onItemSelect={didSelectItem}
        onQueryChange={(q) => setQuery(q)}>
        <Tag interactive large minimal intent='primary'>
          {i18nT('searchInput.placeholder')}
        </Tag>
      </Select>
    </div>
  )
}
