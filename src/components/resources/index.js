import React from 'react'
import { CSSGrid, measureItems, makeResponsive, layout } from 'react-stonecutter'

import { reFuse } from '~mixins/itertools'
import { ResourceCard } from '~components/cards/resources'
import * as Placeholder from './placeholders'


const Grid = makeResponsive(measureItems(CSSGrid, { measureImages: true }), {
  maxWidth: 1280,
  minPadding: 20,
})

const filterKeys = [
  'title',
  'concepts.title',
  'concepts.title_en',
  'concepts.title_fr',
]

export const ResourceCollectionView = ({ resources, ...props }) => {
  return (
    <Grid
      component='ul'
      columnWidth={270}
      gutterWidth={10}
      gutterHeight={20}
      layout={layout.pinterest}
      duration={50}
      className='resources'>
      {resources.map((x, i) =>
        <li key={x.resource_id}>
          <ResourceCard {...x} {...props}/>
        </li>
      )}
    </Grid>
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
