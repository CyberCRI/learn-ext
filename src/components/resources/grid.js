import React from 'react'
import { SpringGrid, makeResponsive } from 'react-stonecutter'
import { ResourceCard } from '~components/cards/resources'
import measureCards from './hoc-measure-cards'
import layoutBricks from './layout-bricks'

const Grid = makeResponsive(measureCards(SpringGrid, { measureImages: true }), {
  maxWidth: 1080,
  minPadding: 0,
})

export const ResourceGrid = ({ resources, ...props }) => {
  return (
    <div className='grid resources'>
      <Grid
        component='div'
        columnWidth={270}
        gutterWidth={10}
        gutterHeight={20}
        layout={layoutBricks}
        enterExitStyle='fromBottom'
        springConfig={{ stiffness: 170, damping: 20 }}
        className='resources'>
        {resources.map((x, i) =>
          <div key={x.resource_id}>
            <ResourceCard {...x} {...props}/>
          </div>
        )}
      </Grid>
    </div>
  )
}
