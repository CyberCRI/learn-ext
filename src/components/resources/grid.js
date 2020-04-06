import React from 'react'
import { CSSGrid, makeResponsive, layout } from 'react-stonecutter'
import { ResourceCard } from '~components/cards/resources'
import measureCards from './hoc-measure-cards'

const Grid = makeResponsive(measureCards(CSSGrid, { measureImages: true }), {
  maxWidth: 1280,
  minPadding: 20,
})

export const ResourceGrid = ({ resources, ...props }) => {
  return (
    <div className='grid resources'>
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
    </div>
  )
}
