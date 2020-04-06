import React from 'react'
import { FixedSizeList as List } from 'react-window'
import { CSSGrid, measureItems, makeResponsive, layout } from 'react-stonecutter'
import { useWindowSize } from 'react-use'
import _chunk from 'lodash/chunk'

import { reFuse } from '~mixins/itertools'
import { ResourceCard } from '~components/cards/resources'
import * as Placeholder from './placeholders'
import Pagination from './pagination'


const filterKeys = [
  'title',
  'concepts.title',
  'concepts.title_en',
  'concepts.title_fr',
]

const Grid = makeResponsive(measureItems(CSSGrid, { measureImages: true }), {
  maxWidth: 1280,
  minPadding: 20,
})

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
  const [pageNumber, setPage] = React.useState(1)

  const rows = _chunk(resources, 20)
  const row = rows[pageNumber - 1] || []
  // const pages = _chunk(rows, 5)

  return (
    <div>
      <Pagination totalCount={rows.length} onPaginate={setPage} current={pageNumber}/>
      <Grid
        component='ul'
        columnWidth={270}
        gutterWidth={10}
        gutterHeight={20}
        layout={layout.pinterest}
        duration={50}
        className='resources'>
        {row.map((x, i) =>
          <li key={x.resource_id}>
            <ResourceCard {...x} {...props}/>
          </li>
        )}
      </Grid>
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
