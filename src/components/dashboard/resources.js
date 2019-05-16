import React from 'react'
import { useLogger } from 'react-use'
import _ from 'lodash'
import { SpringGrid, measureItems, layout } from 'react-stonecutter'

import { reFuse } from '~mixins/itertools'
import { ResourceCard } from '~components/cards/resources'


const Grid = measureItems(SpringGrid)

export const ResourceGrid = ({ resources, filters }) => {
  const visibleResources = () => {
    if (filters.query.length >= 1) {
      // Filter with the query
      return reFuse(resources, [ 'title', 'concepts.title', 'concepts.title_en', 'concepts.title_fr' ]).search(filters.query)
    }
    return resources
  }

  useLogger('ResourceGrid', filters)


  return (
    <Grid
      component='ul'
      columns={4}
      columnWidth={250}
      gutterWidth={15}
      gutterHeight={15}
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
