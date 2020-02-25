import React, { useState } from 'react'
import { useDebounce, useBoolean } from 'react-use'
import { Tag, NonIdealState, Spinner } from '@blueprintjs/core'
import { Select } from '@blueprintjs/select'
import clsx from 'classnames'

import Wiki from '~mixins/wikipedia'
import { i18n } from '@ilearn/modules/i18n'

const i18nT = i18n.context('components.suggest')

// At least these many characters should be typed in to trigger api call:
const MINQUERY_LEN = 2

const conceptPredicate = (query, items) => {
  // NOTE: I've removed the following check, we simply return all the items.
  // if (query) {
  //   return reFuse(items, [ 'title' ]).search(query)
  // }
  return items
}

const renderSuggestion = (item, { modifiers, handleClick }) => {
  if (!modifiers.matchesPredicate) {
    return null
  }
  const itemClasses = clsx('suggestion', {
    active: modifiers.active,
    ambiguous: item.isDisambiguation,
  })

  return (
    <div key={item.title} className={itemClasses} onClick={handleClick}>
      <p>
        <strong>{item.title}</strong>
        {item.extract}
      </p>
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
  } else if (query.length < MINQUERY_LEN) {
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
    position: 'bottom-left',
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
    if (query.length < MINQUERY_LEN) {
      // Yo man! Please type more stuff.
      setItems([])
      return
    }
    setLoadingState(true)
    Wiki
      .srquery(query, lang)
      .then((data) => {
        setItems(data)
        setLoadingState(false)
      })
      .catch(() => {
        setLoadingState(false)
      })
  }, 300, [ query ])

  return (
    <div className='suggest root'>
      <Select
        resetOnQuery={false}
        resetOnSelect={false}
        resetOnClose={false}
        filterable
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
