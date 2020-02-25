import React, { useState } from 'react'
import { useEffectOnce, useSetState, useRafLoop } from 'react-use'
import { Button, Spinner } from '@blueprintjs/core'
import { Helmet } from 'react-helmet'
import moment from 'moment'
import _ from 'lodash'

import { API } from '@ilearn/modules/api'
import { i18n } from '@ilearn/modules/i18n'
import { ResourceGrid, ResourceCollectionView } from '~components/resources'
import * as Placeholder from '~components/resources'
import { OmniBar, FilterTools } from './tools'

import './styles.scss'

const ResourcesInfo = ({ count, len }) => {
  return (
    <div className='resources info-box'>
      <p>Showing {len} of {count} resources</p>
    </div>
  )
}


const DashboardView = () => {
  const [ resources, setResources ] = useState([])
  const [ isLoading, setLoading ] = useState(true)
  const [ statusError, setStatusError ] = useState(false)
  const [ filters, setFilters ] = useSetState({ query: '' })

  const [ count, setCount ] = useState(0)
  const [ offset, setOffset ] = useState(0)

  const fetchBatch = () => {
    API
      .userResources({ skip: offset })
      .then((data) => {
        const allResources = _.unionBy(resources, data.results, 'resource_id')

        if (data.pagination.next) {
          setOffset(data.pagination.next)
        } else {
          setOffset(-1)
        }
        setCount(data.pagination.count)
        setLoading(false)

        setResources(_(allResources)
          .orderBy((res) => moment.utc(res.created), 'desc')
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

  const removeConcept = (payload) => {
    console.log('Removing concept', payload)
    API
      .deleteConceptFromResource(payload)
      .then(() => {
        // Remove concept from this resource's concept list and update the state.
        // We'll do it better later in refactor.
        const { resource_id, wikidata_id } = payload
        const updatedResources = resources.map((r) => {
          if (r.resource_id === resource_id) {
            const concepts = r.concepts.filter((c) => c.wikidata_id !== wikidata_id)
            return { ...r, concepts }
          }
          return r
        })
        setResources(updatedResources)
      })
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
        onRemoveConcept={removeConcept}/>
      <div className='pager'>
        {statusError && <Placeholder.ErrorDescription/>}
        {isLoading && <Spinner/>}
        {offset > 0 && !isLoading &&
          <Button icon='arrow-down' loading={isLoading} text='Load More' onClick={maybeLoadNext}/>}
      </div>
    </div>
  )
}

export { ResourceGrid, OmniBar, FilterTools, DashboardView, ResourceCollectionView }
