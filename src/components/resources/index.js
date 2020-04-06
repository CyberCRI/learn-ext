import React from 'react'
import { FixedSizeList as List } from 'react-window'
import { useWindowSize } from 'react-use'
import _chunk from 'lodash/chunk'

import { reFuse } from '~mixins/itertools'
import { ResourceCard } from '~components/cards/resources'
import * as Placeholder from './placeholders'


const filterKeys = [
  'title',
  'concepts.title',
  'concepts.title_en',
  'concepts.title_fr',
]

const ItemRenderer = ({ index, style, ...props }) => {
  return (
    <div style={style}>
      {index}
    </div>
  )
}

const ItemsRow = ({ items, style, ...props }) => {
  return (
    <div className='item-row'
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-evenly',
        padding: '10px 0',
        ...style,
      }}>
      {items.map((item, ix) => <ResourceCard key={ix} {...item}/>)}
    </div>
  )
}

export const ResourceCollectionView = ({ resources, ...props }) => {
  // take the width of the viewport and try to fit as many elements
  // in a row as possible.
  const viewport = useWindowSize()
  const itemsPerRow = Math.max(Math.floor(viewport.width / 240), 1)
  const rows = _chunk(resources, itemsPerRow)
  // const pages = _chunk(rows, 5)

  return (
    <div>
      <h3>top matches</h3>
      {rows[0] && <ItemsRow items={rows[0]} style={{}}/>}
    </div>

  )
}

export const ResourceGrid = ({ resources, filters, ...props }) => {
  const visibleResources = () => {
    if (filters.query.length >= 1) {
      // Filter with the query
      return reFuse(resources, filterKeys).search(filters.query)
    }
    return resources
  }

  const shownRes = visibleResources()

  if (shownRes.length === 0 && filters.query.length >= 1) {
    // No matches.
    return <Placeholder.NoMatches/>
  }

  if (resources.length === 0) {
    return <Placeholder.NoContent/>
  }

  return <ResourceCollectionView resources={shownRes} {...props}/>
}
