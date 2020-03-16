import React from 'react'
import { SpringGrid, measureItems, makeResponsive, layout } from 'react-stonecutter'

import { useMeasure, useIntersection } from 'react-use'

import { reFuse } from '~mixins/itertools'
import { ResourceCard } from '~components/cards/resources'
import * as Placeholder from './placeholders'

import './styles.scss'

const Grid = makeResponsive(SpringGrid, {
  maxWidth: 1280,
  minPadding: 40,
})
const springGridConf = {
  enterExitStyle: 'fromBottom',
  springConfig: { stiffness: 170, damping: 26 },
}

const filterKeys = [
  'title',
  'concepts.title',
  'concepts.title_en',
  'concepts.title_fr',
]

const ResourceGridItem = ({ resource, ...props }) => {
  const cardRef = React.useRef(null)
  const [ref, { height, x, y }] = useMeasure()
  const visible = useIntersection(cardRef, { root: null, rootMargin: '0px', threshold: 0 })
  const inView = visible && (visible.isIntersecting || visible.isVisible)

  return (
    <li ref={cardRef} className='grid item' data-in-view={inView}>
      <ResourceCard {...resource} {...props}/>
    </li>
  )
}

export const ResourceCollectionView = ({ resources, ...props }) => {
  return (
    <ul className='grid root'>
      {resources.map(r => <ResourceGridItem resource={r} key={r.resource_id} {...props}/>)}
    </ul>
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
