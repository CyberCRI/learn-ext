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
  const [ nextUrl, setNextUrl ] = useState(null)

  useEffectOnce(() => {
    // Fetch the portfolio data
    setLoading(true)
    API.resources({})
      .then((data) => {
        const resources = _(data.results)
          .orderBy((res) => moment.utc(res.created_on), 'desc')
          .uniqBy('resource_id')
          .value()
        setCount(data.pagination.count)
        setNextUrl(data.pagination.next)
        setResources(resources)
        setLoading(false)
      }, () => {
        setStatusError(true)
        setLoading(false)
      })
  })

  useRafLoop(_.debounce(() => {
    const delta = document.body.getBoundingClientRect().bottom - window.innerHeight
    if (delta < 150 && delta > 50) {
      maybeLoadNext()
    }
  }, 10))

  const maybeLoadNext = () => {
    console.log('Maybe loading more...', isLoading, nextUrl)
    if (isLoading || !nextUrl) {
      return
    }
    setLoading(true)
    fetch(`https://welearn.noop.pw/${nextUrl}`)
      .then((r) => r.json())
      .then((d) => {
        const allRes = _.unionBy(resources, d.results, 'resource_id')
        setResources(_(allRes)
          .orderBy((res) => moment.utc(res.created_on), 'desc')
          .uniqBy('resource_id')
          .value())
        setLoading(false)
        setNextUrl(d.pagination.next)
      })
  }

  const deleteResource = (resource_id) => {
    setResources(_(resources).reject(['resource_id', resource_id]).value())
    console.log('will delete', resource_id)
  }

  return (
    <div className='dashboard'>
      <Helmet>
        <title>{i18n.t('pages.dashboard.meta.pageTitle')}</title>
      </Helmet>
      <OmniBar onChange={(q) => setFilters(q)}/>
      <ResourcesInfo len={resources.length} count={count}/>
      <ResourceGrid resources={resources} filters={filters} onDelete={deleteResource}/>
      { nextUrl && <Button icon='arrow-down' loading={isLoading} text='Load More!' onClick={maybeLoadNext}/> }
      { isLoading && <Spinner/> }
      { statusError && <ErrorDescription/> }
    </div>
  )
}

export { ResourceGrid, OmniBar, FilterTools, DashboardView, ResourceCollectionView }
