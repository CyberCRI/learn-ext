import React from 'react'
import styled from 'styled-components'

import { ResourceCard, CardBranding, Backdrop } from '~components/cards/resources'
import { ConceptList } from '~components/concepts'
import { DateTimePill } from '~components/pills'

import { Card, Elevation, Button, Tooltip, Tag, ButtonGroup, Callout } from '@blueprintjs/core'

import { ResourceEditorControl } from './store'


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
  flex-wrap: wrap;

  & > li {
    padding: 2px;
    margin-right: 5px;
  }
`


const HashTags = ({ tags }) => {
  return <HashTagList className='hashtags'>
    {tags.map(tag =>
      <li key={tag}>
        <Tag minimal round interactive intent='primary'># {tag}</Tag>
      </li>
    )}
  </HashTagList>
}

const ResourceNotes = ({ content }) => {
  return <Callout icon='comment'>
    <p>{content}</p>
  </Callout>
}

const ResourceCardContainer = styled.div`
  display: grid;

  grid-template-columns: 60px 10px auto;
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
    background-color: #eee;

    > div {
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
    }
  }

  .info {
    grid-area: info;

    .pills {
      margin: 5px 0;
    }

    .hashtags {
      margin: 8px 0;
    }
  }

  .actions {
    grid-area: actions;
    margin-top: 5px;
    justify-self: end;
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
          href={resource.url}
          title={resource.title}
          target='_blank'
          rel='noopener,nofollow'
          className='overlay-link'>
          <h3 className='title'>{resource.title}</h3>
        </a>
        <div className='pills'>
          {!!resource.created_on && <DateTimePill timestamp={resource.created_on}/>}
          <CardBranding url={resource.url}/>
        </div>
        <div className='concepts'>
          <ConceptList concepts={resource.concepts} noAnimation lang={resource.lang}/>
          {resource.is_owner && <HashTags tags={resource.hashtags}/>}
          {resource.is_owner && resource.notes && <ResourceNotes content={resource.notes}/>}
        </div>
      </div>
      {resource.is_owner && <div className='actions'>
        <Button
          icon='edit'
          text='Edit'
          minimal outlined
          onClick={() => ResourceEditorControl.show(resource)}/>
      </div>}
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
