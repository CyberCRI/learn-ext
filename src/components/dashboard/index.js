import React, { useState } from 'react'
import { useEffectOnce, useSetState } from 'react-use'
import moment from 'moment'
import _ from 'lodash'

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
        const resources = _(data.resources)
          .orderBy((res) => moment.utc(res.created_on), 'desc')
          .value()
        setResources(resources)
      })
  })

  return (
    <div className='dashboard'>
      <OmniBar onChange={(q) => setFilters(q)}/>
      <ResourceGrid resources={resources} filters={filters}/>
    </div>
  )
}

export { ResourceGrid, OmniBar, FilterTools, DashboardView }
