import React from 'react'
import styled from 'styled-components'
import _ from 'lodash'

import { CardBranding } from '~components/cards/resources'
import { ConceptList } from '~components/concepts'
import { DateTimePill } from '~components/pills'

import { Card, Elevation, Button, Callout } from '@blueprintjs/core'
import { RiAnchorLine } from 'react-icons/ri'

import { ResourceEditorControl } from './store'

import { HashTags } from './hashtags'
import { VoteButtons } from './vote-buttons'


const ResourceItemContainer = styled.div`
  margin-bottom: 10px;
  width: 100%;
  max-width: 600px;

  .bp3-card {
    padding: 10px;
  }
`

const CommentsListContainer = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;

  & > li {
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;

    margin-bottom: 5px;
  }

  li.comment {
    .user-info {
      display: flex;
      align-items: center;

      .user-icon {
        border-radius: 50%;
        width: 22px;
        height: 22px;
        background-color: #CDDC39;
        text-align: center;
        margin-right: 5px;
        padding: 2px;

        span {
          font-weight: 600;
          text-transform: uppercase;
          font-size: 18px;
          line-height: 1;
        }
      }

      .user-name {
        font-size: smaller;
        color: #777;
      }
    }
    .notes {
      margin-left: 25px;
    }
  }

`

const ResourceNotes = ({ content }) => {
  return <Callout icon='comment'>
    <p>{content}</p>
  </Callout>
}

const ResourceComment = ({ comment }) => {
  if (!comment.notes) {
    // if comment.notes is empty, we'll skip rendering this.
    return null
  }

  return <li className='comment'>
    <div className='user-info'>
      <div className='user-icon'>
        <span>{comment.user_email[0]}</span>
      </div>
      <div className='user-name'>added by <strong>{comment.user_email}</strong></div>
    </div>
    <div className='notes'>{comment.notes}</div>
  </li>
}

const ResourceCommentsList = ({ comments }) => {
  return <CommentsListContainer className='comments-list'>
    {comments.map(item => <ResourceComment key={item.uid} comment={item}/>)}
  </CommentsListContainer>
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
const ResourceCardActions = styled.div`
  display: flex;
  justify-content: space-between;
`


export const ResourceItem = (resource) => {
  const imageUrl = encodeURI(`/meta/resolve/image?url=${resource.url}`)

  // collect hashtags together if the comment list is present.
  let allhashtags = resource.hashtags
  if (resource.comments) {
    allhashtags = _(resource.comments).flatMap('hashtags').uniq().value()
  }

  const openEditor = (mode) => {
    let resource_payload = {...resource}
    if (resource.comments && resource.is_owner && window.jstate.authorized) {
      const user_id = window.jstate.user.uid
      const current_user_comment = resource.comments.find(item => item.user_id == user_id)

      if (current_user_comment) {
        resource_payload.hashtags = current_user_comment.hashtags || []
        resource_payload.notes = current_user_comment.notes || ''
      }
    }

    ResourceEditorControl.show({ mode, resource: resource_payload })
  }

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
          {allhashtags && <HashTags tags={allhashtags}/>}
        </div>
      </div>
    </ResourceCardContainer>
    <div className='comments'>
      {resource.notes && <ResourceNotes content={resource.notes}/>}
      {resource.comments && <ResourceCommentsList comments={resource.comments}/>}
    </div>

    <div className='card-footer'>
      <ResourceCardActions>
        <VoteButtons
          resource_id={resource.resource_id}
          has_voted={resource.has_voted}
          upvotes={resource.upvotes}
          downvotes={resource.downvotes}/>
        {resource.is_owner &&
          <Button
            icon='edit'
            text='Edit'
            minimal outlined
            onClick={() => openEditor('edit')}/>}
        {!resource.is_owner && window.jstate.authorized &&
            <Button
              icon={<RiAnchorLine/>}
              text='Add to my Library'
              minimal outlined
              intent='primary'
              onClick={() => openEditor('add')}/>}
      </ResourceCardActions>
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
