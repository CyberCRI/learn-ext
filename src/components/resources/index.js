import React from 'react'
import { FixedSizeList as List } from 'react-window'
import { useWindowSize } from 'react-use'

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
  console.log(itemsPerRow)


  return (
    <List height={800} itemCount={Math.floor(resources.length / itemsPerRow)} itemSize={400}>
      {({ index, style }) => (
        <ItemsRow items={resources.slice(index * itemsPerRow, (index + 1) * itemsPerRow)} style={style}/>
      )}
    </List>
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
