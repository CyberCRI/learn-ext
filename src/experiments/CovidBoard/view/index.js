import React from 'react'

import { ResourceCard } from '~components/cards/resources'
import './style.scss'

export const ResourceList = ({ items }) => {
  return <ul>
    {items.map(r =>
      <li key={r.resource_id}>
        <ResourceCard {...r}/>
      </li>
    )}
  </ul>
}
