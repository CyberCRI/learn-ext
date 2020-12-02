import React, { useState } from 'react'
import _ from 'lodash'
import { useDebounce, useBoolean } from 'react-use'
import { NonIdealState, Spinner, Button } from '@blueprintjs/core'
import { Select } from '@blueprintjs/select'
import clsx from 'classnames'

import Wiki from '@ilearn/modules/api/wikipedia'
import { i18n } from '@ilearn/modules/i18n'

import { ConceptList } from '~components/concepts'

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

  const text = item.subtitle
    ? item.subtitle
    : item.extract ? item.extract : ''

  return (
    <div key={item.title} className={itemClasses} onClick={handleClick}>
      <p>
        <strong>{item.title}</strong>
        {text}
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
    className: 'wiki-concept suggest input',
    minimal: true,
  },
  popover: {
    position: 'bottom-left',
    minimal: false,
    usePortal: true,
    className: 'wiki-concept suggest target',
    portalClassName: 'wiki-concept suggest popover',
    modifiers: {
      arrow: { enabled: true },
      flip: { enabled: true },
    },
  },
}

export const WikiConceptSuggest = ({ onSelect, lang, usePortal=true }) => {
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
      .prefixsearch(query, lang)
      .then((data) => {
        setItems(data)
        setLoadingState(false)
      })
      .catch(() => {
        setLoadingState(false)
      })
  }, 300, [ query ])

  return (
    <div className='wiki-concept suggest root'>
      <Select
        resetOnQuery={false}
        resetOnSelect={false}
        resetOnClose={false}
        filterable
        itemListPredicate={conceptPredicate}
        itemRenderer={renderSuggestion}
        items={items}

        inputProps={({...controlProps.input, loading})}
        popoverProps={({...controlProps.popover, usePortal })}

        noResults={<ZeroResultsState loading={loading} query={query}/>}
        initialContent={<EmptyStatePlaceholder/>}

        query={query}
        onItemSelect={didSelectItem}
        onQueryChange={(q) => setQuery(q)}>
        <Button icon='plus' intent='primary' outlined minimal text={i18nT('searchInput.placeholder')}/>
      </Select>
    </div>
  )
}

export const WikiConceptInput = ({ value, lang, onChange, usePortal=true }) => {
  const [ concepts, setConcepts ] = useState(value || [])

  React.useEffect(() => {
    onChange(concepts)
  }, [concepts])

  const didAddConcept = (concept) => {
    const newSelection = _.unionBy(concepts, [concept], 'wikidata_id')
    setConcepts(newSelection)
  }
  const didRemoveConcept = (concept) => {
    const newSelection = _.reject(concepts, ['wikidata_id', concept.wikidata_id])
    setConcepts(newSelection)
  }

  return (
    <div className='wiki-concept input'>
      <ConceptList concepts={concepts} removable onRemove={didRemoveConcept} emitClick={false}/>
      <WikiConceptSuggest onSelect={didAddConcept} lang={lang} usePortal={usePortal}/>
    </div>
  )
}
