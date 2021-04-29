import React from 'react'
import styled from 'styled-components'
import _ from 'lodash'
import ColorHash from 'color-hash'

import { CardBranding } from '~components/cards/resources'
import { ConceptList } from '~components/concepts'
import { DateTimePill } from '~components/pills'

import { Card, Elevation, Button, Callout, Popover } from '@blueprintjs/core'
import { RiAnchorLine } from 'react-icons/ri'

import { ResourceEditorControl, ResourceDetailsDialogControl } from './store'

import { HashTags } from './hashtags'
import { VoteButtons } from './vote-buttons'

const colorHash = new ColorHash({ lightness: 0.5 })

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
          color: #fff;
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

const OwnersListContainer = styled.ol`
  list-style: none;
  margin: 0;
  padding: 5px;
`

const OwnerItemContainer = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: 5px;

  &:last-of-type {
    margin-bottom: 0;
  }

  .user-icon {
    border-radius: 50%;
    width: 22px;
    height: 22px;
    background-color: #CDDC39;
    text-align: center;
    padding: 2px;
    margin-right: 5px;
    color: #fff;

    span {
      font-weight: 600;
      text-transform: uppercase;
      font-size: 18px;
      line-height: 1;
    }
  }

  .owner-info {
    display: flex;
    align-items: baseline;

    .spacer {
      margin: 0 5px;
    }
  }
`

const ResourceOwnerListContainer = styled.div`
  color: #555;
  margin-bottom: 5px;

  .owner-popover {
    margin-left: 5px;
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
      <div className='user-icon' style={{backgroundColor: colorHash.hex(comment.user_email)}}>
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

const ResourceOwner = ({ owner }) => {
  const ownerUrl = `/pages/profile.html?user_id=${owner.uid}`
  return <OwnerItemContainer>
    <div className='user-icon' style={{backgroundColor: colorHash.hex(owner.email)}}>
      <span>{owner.email[0]}</span>
    </div>
    <div className='owner-info'>
      <a href={ownerUrl}><span>{owner.email}</span></a>
      <span className='spacer'>|</span>
      <DateTimePill timestamp={owner.created_on}/>
    </div>
  </OwnerItemContainer>
}

const ResourceOwnersList = ({ owners }) => {
  const OwnerList = <OwnersListContainer>
    {owners.map(owner => <ResourceOwner key={owner.uid} owner={owner}/>)}
  </OwnersListContainer>

  const lastOwner = owners.slice(-1)[0]

  return <ResourceOwnerListContainer>
    <span>
      Added by <strong><a href={`/pages/profile.html?user_id=${lastOwner.uid}`}>{lastOwner.email}</a></strong>
      {' '}
      {owners.length > 1 && <span>and {owners.length - 1} others</span>}
    </span>
    <Popover content={OwnerList} target={<Button icon='more' small className='owner-popover'/>}/>
  </ResourceOwnerListContainer>
}


const ResourceCardContainer = styled.div`
  display: grid;

  grid-template-columns: 60px 10px auto 28px;
  grid-template-rows: repeat(3, auto);
  grid-template-areas:
    "image . info more"
    ". . info ."
    ". actions actions actions";

  .button.more {
    grid-area: more;
    align-self: baseline;
  }

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

  const openDetails = (e) => {
    ResourceDetailsDialogControl.show({ resource })
  }

  return <Card elevation={Elevation.TWO} interactive className='resource-item'>
    <div className='underlay-link' onClick={openDetails}/>
    <ResourceCardContainer>
      <div className='image'>
        <div style={{ backgroundImage: `url(${imageUrl})`}}/>
      </div>
      <Button icon='more' className='button more' minimal onClick={openDetails}/>
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
    <div className='owners'>
      {(resource.owners && resource.owners.length > 0) && <ResourceOwnersList owners={resource.owners}/>}
    </div>

    <div className='card-footer'>
      <ResourceCardActions>
        <VoteButtons
          resource_id={resource.resource_id}
          has_voted={resource.has_voted}
          upvotes={resource.upvotes}
          downvotes={resource.downvotes}/>
        {resource.is_owner === true &&
          <Button
            icon='edit'
            text='Edit'
            minimal outlined
            onClick={() => openEditor('edit')}/>}
        {resource.is_owner === false && window.jstate.authorized &&
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
