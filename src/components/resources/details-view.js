import React from 'react'
import { useStore } from 'effector-react'
import { useAsync } from 'react-use'
import styled from 'styled-components'

import { Dialog, NonIdealState, Button, Spinner } from '@blueprintjs/core'

import { ResourceCard } from '~components/cards/resources'
import { ResourceItem } from '~components/resources'

import { RecommendedResourcesAPI } from '@ilearn/modules/api'

import { $DetailsDialog, ResourceDetailsDialogControl } from './store'


const SimilarResourcesListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  align-items: start;

  .resource.card {
    margin: 10px;
  }
`

const LoadingStateSpinner = () => {
  return <NonIdealState><Spinner/></NonIdealState>
}

const SimilarResourcesList = ({ resources }) => {
  if (resources.length === 0) {
    return <NonIdealState
      icon='offline'
      description={'No Similar Resources found.'}/>
  }
  return <SimilarResourcesListContainer>
    {resources.map(r => <ResourceCard key={r.resource_id} {...r}/>)}
  </SimilarResourcesListContainer>
}

const SimilarResources = ({ resource_id, ...props }) => {
  const resources = useAsync(async () => {
    return await RecommendedResourcesAPI.getSimilarResources({ resource_id })
  }, [resource_id])

  return <div>
    {resources.loading && <LoadingStateSpinner/>}
    {resources.value && <SimilarResourcesList resources={resources.value}/>}
  </div>
}


export const ResourceDetailsDialog = () => {
  const dialog = useStore($DetailsDialog)
  const resource = dialog.resource

  return (
    <Dialog
      isOpen={dialog.isOpen}
      onClose={ResourceDetailsDialogControl.hide}
      className='dialog resource-details-view'>
      <div className='body'>
        <Button
          onClick={ResourceDetailsDialogControl.hide}
          icon='cross'
          className='close-button'/>

        {resource && <ResourceItem resource={resource}/>}

        <div className='similar-resources'>
          <h3 className='heading'>Similar Resources</h3>
          {resource && <SimilarResources resource_id={resource.resource_id}/>}
        </div>
      </div>
    </Dialog>
  )
}
