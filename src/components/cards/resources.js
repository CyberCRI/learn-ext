import React, { useState } from 'react'
import { Card, Elevation, Button, Tooltip } from '@blueprintjs/core'
import { useUpdateEffect } from 'react-use'
import _ from 'lodash'
import clsx from 'classnames'

import { ConceptList } from '~components/concepts'
import { DateTimePill, ResourceLinkPill } from '~components/pills'
import OG from '~mixins/opengraph'


export const Backdrop = ({ url }) => {
  const [ display, setDisplay ] = useState({ hidden: true })
  const imageDidLoad = (e) => {
    const { naturalWidth, naturalHeight, height } = e.target
    // If the ratio of the image dimension exceeds width that's much greater
    // than the height, or its dimensions are too small, we hide it.
    const ratio = naturalWidth / naturalHeight

    if (ratio > 5 || naturalHeight < 80 || naturalWidth < 160) {
      setDisplay({ height: 0, hidden: true })
    } else {
      // Use the rendered image height for the figure height. We'll rely on CSS
      // so it won't exceed max-height value.
      setDisplay({ height, hidden: false })
    }
  }

  const imageDidNotLoad = (e) => {
    setDisplay({ height: 0, hidden: true })
  }

  const bgClasses = clsx('backdrop', { hidden: display.hidden })

  return (
    <figure className={bgClasses} style={{ height: display.height }}>
      <img src={OG.image(url)} onLoad={imageDidLoad} onError={imageDidNotLoad}/>
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

  return (
    <Card elevation={Elevation.TWO} interactive className='card resource'>
      { !props.skipMedia && <Backdrop url={url}/> }
      <div className='content'>
        <h4 className='title'>{props.title}</h4>
        {!!props.created_on && <DateTimePill timestamp={props.created_on}/>}

        {!props.skipConceptList &&
          <ConceptList
            concepts={concepts.map((c) => ({
              title: c[`title_${props.lang}`] || c.title_en,
              ...c,
            }))}
            lang={props.lang}
            removable={isRemovable}
            onRemove={didRemoveConcept}
            noAnimation/>}

        {isRemovable && <DeleteResourceButton onConfirm={didClickDelete}/>}
        <ResourceLinkPill url={url} short linked/>
        <a
          ariahidden='true'
          role='presentation'
          href={url}
          title={props.title}
          target='_blank'
          rel='noopener,nofollow'
          tabIndex={1}
          className='overlay-link'>Open {props.title} in new tab</a>
      </div>
    </Card>
  )
}
