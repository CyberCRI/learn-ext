import React from 'react'
import { useStore } from 'effector-react'
import _ from 'lodash'

import { ResourceCollectionView } from '~components/dashboard'
import { ConceptList } from '~components/concepts'
import { selectedConcepts, userResourcesIndex } from './store'

export const OverlayCards = (props) => {
  const conceptList = useStore(selectedConcepts)
  const resourceIndex = userResourcesIndex.getState()

  const matchingResources = _(conceptList)
    .filter('userData')
    .map((c) => resourceIndex.search(c.title))
    .flatten()
    .uniqBy('resource_id')
    .value()

  if (conceptList.length > 0) {
    return (
      <div className='matches'>
        <ConceptList concepts={conceptList}/>
        <ResourceCollectionView resources={matchingResources} skipConceptList/>
      </div>
    )
  }

  return (
    <div className='matches'>
      <p>Pick concepts from the map above to see matching resources.</p>
    </div>
  )
}
