import React, { useState } from 'react'
import { useEffectOnce, useSetState, useRafLoop } from 'react-use'
import { Button, Spinner } from '@blueprintjs/core'
import { Helmet } from 'react-helmet'
import moment from 'moment'
import _ from 'lodash'

import { i18n } from '@ilearn/modules/i18n'
import { ResourceGrid, ResourceCollectionView } from './resources'
import { OmniBar, FilterTools } from './tools'
import { API } from '@ilearn/modules/api'

import './styles.scss'

const ResourcesInfo = ({ count, len }) => {
  return (
    <div className='resources info-box'>
      <p>Showing {len} of {count} resources</p>
    </div>
  )
}

const ErrorDescription = (props) => {
  return (
    <div className='resources error'>
      <h1>:(</h1>
      <p>Couldn't load resources.</p>
    </div>
  )
}


const DashboardView = () => {
  const [ resources, setResources ] = useState([])
  const [ isLoading, setLoading ] = useState(true)
  const [ statusError, setStatusError ] = useState(false)
  const [ filters, setFilters ] = useSetState({ query: '' })

  const [ count, setCount ] = useState(0)
  const [ offset, setOffset ] = useState(1)

  const fetchBatch = () => {
    API
      .userResources({ start: offset })
      .then((data) => {
        const allResources = _.unionBy(resources, data.results, 'resource_id')

        const pageOffset = data.pagination.start + data.pagination.limit
        if (pageOffset < data.pagination.count) {
          setOffset(pageOffset)
        } else {
          setOffset(-1)
        }
        setCount(data.pagination.count)
        setLoading(false)

        setResources(_(allResources)
          .orderBy((res) => moment.utc(res.created_on), 'desc')
          .uniqBy('resource_id')
          .value())
      }, () => {
        setStatusError(true)
        setLoading(false)
      })
  }

  useEffectOnce(() => {
    // Fetch the portfolio data
    setLoading(true)
    fetchBatch()
  })

  useRafLoop(_.debounce(() => {
    const delta = document.body.getBoundingClientRect().bottom - window.innerHeight
    if (delta < 150 && delta > 50) {
      maybeLoadNext()
    }
  }, 10))

  const maybeLoadNext = () => {
    console.log('Maybe loading more...', isLoading)
    if (offset < 0 || isLoading) {
      return
    }
    setLoading(true)
    fetchBatch()
  }

  const deleteResource = (resource_id) => {
    API
      .deleteResource({ resource_id })
      .then(() => {
        setResources(
          _(resources)
            .reject(['resource_id', resource_id])
            .value())
      })
  }

  }

  return (
    <div className='dashboard'>
      <Helmet>
        <title>{i18n.t('pages.dashboard.meta.pageTitle')}</title>
      </Helmet>
      <OmniBar onChange={(q) => setFilters(q)}/>
      <ResourcesInfo len={resources.length} count={count}/>
      <ResourceGrid
        resources={resources}
        filters={filters}
        onDelete={deleteResource}
      <div className='pager'>
        {statusError && <ErrorDescription/>}
        {isLoading && <Spinner/>}
        {offset > 0 && !isLoading &&
          <Button icon='arrow-down' loading={isLoading} text='Load More' onClick={maybeLoadNext}/>}
      </div>
    </div>
  )
}

export { ResourceGrid, OmniBar, FilterTools, DashboardView, ResourceCollectionView }
