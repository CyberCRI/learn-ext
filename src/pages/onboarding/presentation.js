import React from 'react'
import { sampleSize } from 'lodash'

import { ResourceCard } from '~components/cards'

import sampleResources from './resource-sample.json'


export const DemoCards = (props) => {
  const sampledItems = sampleSize(sampleResources, 10)
  return <>
    {sampledItems.map((r) => <ResourceCard key={r.resource_id} {...r}/>)}
  </>
}
