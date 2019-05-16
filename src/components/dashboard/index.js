import React, { useState } from 'react'
import { useEffectOnce, useSetState } from 'react-use'

import RootAPI from '~mixins/root-api'
import { ResourceGrid } from './resources'
import { OmniBar, FilterTools } from './tools'

import './styles.scss'


const DashboardView = () => {
  const [ resources, setResources ] = useState([])
  const [ filters, setFilters ] = useSetState({ query: '' })

  useEffectOnce(() => {
    // Fetch the portfolio data
    RootAPI.fetchPortfolio()
      .then((data) => {
        setResources(data.resources)
      })
  })

  return (
    <div>
      <OmniBar onChange={(q) => setFilters(q)}/>
      <FilterTools/>
      <ResourceGrid resources={resources} filters={filters}/>
    </div>
  )
}

export { ResourceGrid, OmniBar, FilterTools, DashboardView }
