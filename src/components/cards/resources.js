import React, { useState } from 'react'
import { Card, Elevation, Button, Tooltip } from '@blueprintjs/core'
import { useUpdateEffect } from 'react-use'
import styled from 'styled-components'
import clsx from 'classnames'
import _ from 'lodash'
import { RiAnchorLine } from 'react-icons/ri'

import { ConceptList } from '~components/concepts'
import { DateTimePill, ResourceLinkPill } from '~components/pills'

import { ResourceEditorControl } from '~components/resources/store'
import { HashTags } from '~components/resources/hashtags'

const ResourceTypes = new Map([
  ['wikipedia',     /.*\.wikipedia\.org/],
  ['cri-projects',  /.*projects\.cri-paris\.(org|net)/],
  ['github',        /.*(github.com|\.github.io)/],
  ['youtube',       /.*\.youtube.com/],
])

function inferredResourceType (url) {
  for (let [rtype, regex] of ResourceTypes) {
    if (regex.test(url)) {
      return rtype
    }
  }
}

const BrandDiv = styled.div`
  margin-top: 10px;
  display: flex;
`
const LogoImg = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 10px;
`
const LogoSpan = styled.span`
  font-weight: 500;
  letter-spacing: .1px;
`

export const CardBranding = ({ url }) => {
  const kind = inferredResourceType(url)

  if (kind === 'cri-projects') {
    return (
      <BrandDiv>
        <LogoImg lazy='true' src='/media/logos/cri-projects.png'/>
        <LogoSpan>Project</LogoSpan>
      </BrandDiv>
    )
  }
  return <ResourceLinkPill url={url} short linked/>

}

export const Backdrop = ({ url }) => {
  const origin = document.location.protocol === 'https:' ? '' : env.ngapi_host
  const imageUrl = `${origin}/meta/resolve/image?url=${url}`

  const [ display, setDisplay ] = useState({ hidden: true })
  const imageDidLoad = (e) => {
    const { naturalWidth, naturalHeight, height } = e.target
    // If the ratio of the image dimension exceeds width that's much greater
    // than the height, or its dimensions are too small, we hide it.
    const ratio = naturalWidth / naturalHeight
    setDisplay({ hidden: (ratio > 5 || naturalHeight < 80 || naturalWidth < 160) })
  }

  const imageDidNotLoad = (e) => {
    setDisplay({ hidden: true })
  }

  const bgClasses = clsx('backdrop', { hidden: display.hidden })

  return (
    <figure className={bgClasses}>
      <img
        src={encodeURI(imageUrl)}
        onLoad={imageDidLoad}
        onError={imageDidNotLoad}
        lazy='true'/>
    </figure>
  )
}

export const DeleteResourceButton = ({ onConfirm, ...props }) => {
  const [ intent, setIntention ] = useState('init')

  const didClickButton = () => {
    if (intent === 'init') {
      // Ask for confirmation, and revert to `init` state unless intent changes
      // within 4000ms.
      setIntention('confirm')
    } else if (intent === 'confirm') {
      // Emit deletion event.
      setIntention('undo')
      onConfirm()
    }
  }

  useUpdateEffect(() => {
    const timer = window.setTimeout(() => {
      if (intent === 'confirm') {
        setIntention('init')
      }
    }, 4000)
    return () => {
      // Make sure to clean up after ourselves.
      window.clearTimeout(timer)
    }
  }, [ intent ])

  const buttonParams = {
    init: {
      icon: 'cross',
      text: 'Delete',
      intent: 'default',
    },
    confirm: {
      icon: 'outdated',
      text: 'Click again to confirm!',
      intent: 'danger',
    },
    undo: {
      icon: 'undo',
      text: 'Undo',
      loading: true,
    },
  }

  const impliedProps = buttonParams[intent]

  return (
    <Tooltip
      content={<span>{impliedProps.text}</span>}
      position='left-top'
      intent={impliedProps.intent}
      usePortal={false}
      className='action delete container'>
      <Button
        onClick={didClickButton}
        small
        minimal
        rightIcon={impliedProps.icon}
        loading={impliedProps.loading}/>
    </Tooltip>
  )
}

export const ResourceCard = ({ url, concepts=[], onDelete, ...props}) => {
  const isRemovable = onDelete !== undefined
  const didClickDelete = () => {
    onDelete && onDelete(props.resource_id)
  }
  const didRemoveConcept = (concept) => {
    const payload = {
      resource_id: props.resource_id,
      wikidata_id: concept.wikidata_id,
    }
    props.onRemoveConcept && props.onRemoveConcept(payload)
  }

  const openEditor = (mode) => {
    let resource_payload = {url, concepts, ...props}
    if (props.comments && props.is_owner && window.jstate.authorized) {
      const user_id = window.jstate.user.uid
      const current_user_comment = props.comments.find(item => item.user_id == user_id)

      if (current_user_comment) {
        resource_payload.hashtags = current_user_comment.hashtags || []
        resource_payload.notes = current_user_comment.notes || ''
      }
    }

    ResourceEditorControl.show({ mode, resource: resource_payload })
  }

  let allhashtags = props.hashtags
  if (props.comments) {
    allhashtags = _(props.comments).flatMap('hashtags').uniq().value()
  }

  return (
    <Card elevation={Elevation.TWO} interactive className='card resource'>
      {!props.skipMedia && <Backdrop url={url}/>}
      {!props.skipLink &&
        <a
          ariahidden='true'
          role='presentation'
          href={url}
          title={props.title}
          target='_blank'
          rel='noopener,nofollow'
          tabIndex={1}
          className='overlay-link'>Open {props.title} in new tab</a>}
      <div className='content'>
        <h4 className='title'>{props.title}</h4>
        {!!props.created_on && <DateTimePill timestamp={props.created_on}/>}

        {!props.skipConceptList &&
          <ConceptList
            concepts={concepts}
            lang={props.lang}
            removable={isRemovable}
            onRemove={didRemoveConcept}
            noAnimation/>}

        {allhashtags && <HashTags tags={allhashtags}/>}

        {isRemovable && <DeleteResourceButton onConfirm={didClickDelete}/>}
        <CardBranding url={url}/>

        <div className='actions'>
          {props.is_owner === true &&
            <Button
              icon='edit'
              text='Edit'
              minimal outlined
              onClick={() => openEditor('edit')}/>}
          {props.is_owner === false && window.jstate.authorized &&
            <Button
              icon={<RiAnchorLine/>}
              text='Add to my Library'
              minimal outlined
              intent='primary'
              onClick={() => openEditor('add')}/>}
        </div>
      </div>
    </Card>
  )
}
