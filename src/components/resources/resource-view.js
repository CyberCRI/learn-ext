import React from 'react'
import styled from 'styled-components'

import { ResourceCard, CardBranding } from '~components/cards/resources'
import { ConceptList } from '~components/concepts'

import { Card, Elevation, Button, Tooltip } from '@blueprintjs/core'


const ResourceItemContainer = styled.div`
  margin-bottom: 10px;
  width: 100%;
  max-width: 600px;
`

const HashTagList = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;

  & > li {
    padding: 2px;
    margin-right: 5px;
  }
`


const HashTags = ({ tags }) => {
  return <HashTagList>
    {tags.map(tag =>
      <li key={tag}>#{tag}</li>
    )}
  </HashTagList>
}

export const ResourceItem = (resource) => {
  return <Card elevation={Elevation.TWO} interactive>
    <div>
      <h3 className='title'>{resource.title}</h3>
      <CardBranding url={resource.url}/>
      <ConceptList concepts={resource.concepts} noAnimation lang={resource.lang}/>

      {resource.is_owner && <HashTags tags={resource.tags}/>}
    </div>
  </Card>
}


export const ResourceListView = ({ resources, ...props }) => {
  return (
    <div>
      {resources.map((x, i) =>
        <ResourceItemContainer key={x.resource_id}>
          <ResourceItem {...x} {...props}/>
        </ResourceItemContainer>
      )}
    </div>
  )
}
