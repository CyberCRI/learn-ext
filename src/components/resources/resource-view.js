import React from 'react'
import styled from 'styled-components'

import { ResourceCard, CardBranding, Backdrop } from '~components/cards/resources'
import { ConceptList } from '~components/concepts'

import { Card, Elevation, Button, Tooltip, Tag } from '@blueprintjs/core'


const ResourceItemContainer = styled.div`
  margin-bottom: 10px;
  width: 100%;
  max-width: 600px;

  .bp3-card {
    padding: 10px;
  }
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

const ResourceCardContainer = styled.div`
  display: grid;

  grid-template-columns: 60px 5px auto;
  grid-template-rows: repeat(3, auto);
  grid-template-areas:
    "image . info"
    ". . info"
    ". actions actions";

  .image {
    grid-area: image;
    width: 60px;
    height: 60px;
    position: relative;
    overflow: hidden;
    border-radius: 5px;
    border: 1px solid #ccc;

    > div {
      width: 100%;
      height: 100%;
      background-size: cover;
      background-color: #eee;
    }
  }

  .info {
    grid-area: info;
  }

  .actions {
    grid-area: actions;
  }

`

export const ResourceItem = (resource) => {
  const imageUrl = encodeURI(`/meta/resolve/image?url=${resource.url}`)

  return <Card elevation={Elevation.TWO} interactive>
    <ResourceCardContainer>
      <div className='image'>
        <div style={{ backgroundImage: `url(${imageUrl})`}}/>
      </div>
      <div className='info'>
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
        <CardBranding url={resource.url}/>
        <div className='concepts'>
          <ConceptList concepts={resource.concepts} noAnimation lang={resource.lang}/>
          {resource.is_owner && <HashTags tags={resource.tags}/>}
        </div>
      </div>
      <div className='actions'>
        <Button icon='more'/>
      </div>
    </ResourceCardContainer>
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
