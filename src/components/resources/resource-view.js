import React from 'react'
import styled from 'styled-components'

import { ResourceCard, CardBranding } from '~components/cards/resources'
import { ConceptList } from '~components/concepts'

import { Card, Elevation, Button, Tooltip, Tag } from '@blueprintjs/core'


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
      <li key={tag}>
        <Tag minimal round interactive intent='primary'># {tag}</Tag>
      </li>
    )}
  </HashTagList>
}

export const ResourceItem = (resource) => {
  return <Card elevation={Elevation.TWO} interactive>
    <div>
      <a
        ariahidden='true'
        role='presentation'
        href={resource.url}
        title={resource.title}
        target='_blank'
        rel='noopener,nofollow'
        tabIndex={1}
        className='overlay-link'>
        <h3 className='title'>{resource.title}</h3>
      </a>
    </div>
    <div>

      <CardBranding url={resource.url}/>

      <ConceptList concepts={resource.concepts} noAnimation lang={resource.lang}/>

      {resource.is_owner && <HashTags tags={resource.tags}/>}
    </div>
    <div>
      <Button icon='more'/>
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
