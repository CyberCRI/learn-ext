import React from 'react'
import _ from 'lodash'
import { SpringGrid, measureItems, makeResponsive, layout } from 'react-stonecutter'

import { reFuse } from '~mixins/itertools'
import { ResourceCard } from '~components/cards/resources'


const Grid = makeResponsive(measureItems(SpringGrid, { measureImages: true }), {
  maxWidth: 1280,
  minPadding: 40,
})

const filterKeys = [
  'title',
  'concepts.title',
  'concepts.title_en',
  'concepts.title_fr',
]

export const ResourceGrid = ({ resources, filters }) => {
  const visibleResources = () => {
    if (filters.query.length >= 1) {
      // Filter with the query
      return reFuse(resources, filterKeys).search(filters.query)
    }
    return resources
  }

  return (
    <Grid
      component='ul'
      columnWidth={220}
      gutterWidth={20}
      gutterHeight={20}
      layout={layout.pinterest}
      enterExitStyle='fromBottom'
      springConfig={{ stiffness: 200, damping: 20 }}
      className='resources'>
      {visibleResources().map((x, i) =>
        <li key={x.url}>
          <ResourceCard {...x} />
        </li>
      )}
    </Grid>
  )
}
