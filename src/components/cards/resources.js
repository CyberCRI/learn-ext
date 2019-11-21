import React, { useState } from 'react'
import { Card, Elevation, Button } from '@blueprintjs/core'
import _ from 'lodash'
import clsx from 'classnames'

import { ConceptList } from '~components/concepts'
import { DateTimePill, ResourceLinkPill } from '~components/pills'
import OG from '~mixins/opengraph'


export const Backdrop = ({ url }) => {
  const [ display, setDisplay ] = useState({})
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
      setDisplay({ height })
    }
  }

  const imageDidNotLoad = (e) => {
    setDisplay({ hidden: true })
  }

  const bgClasses = clsx('backdrop', { hidden: display.hidden })

  return (
    <figure className={bgClasses} style={{ height: display.height }}>
      <img src={OG.image(url)} onLoad={imageDidLoad} onError={imageDidNotLoad}/>
    </figure>
  )
}

export const ResourceCard = ({ url, concepts=[], onDelete, ...props}) => {
  const isRemovable = onDelete !== undefined
  const didClickDelete = () => {
    onDelete && onDelete(props.resource_id)
  }
  return (
    <Card elevation={Elevation.TWO} interactive className='card resource'>
      { !props.skipMedia && <Backdrop url={url}/> }
      <div className='content'>
        <h4 className='title'>{props.title}</h4>
        {isRemovable && <Button onClick={didClickDelete} text='Delete' icon='delete'/> }
        {!!props.created_on && <DateTimePill timestamp={props.created_on}/>}

        {!props.skipConceptList &&
          <ConceptList
            concepts={concepts.map((c) => ({
              title: c[`title_${props.lang}`] || c.title_en,
              ...c,
            }))}
            lang={props.lang}
            removable={isRemovable}
            noAnimation/>}
        <ResourceLinkPill url={url} short linked/>
        <a
          ariaHidden={true}
          role='presentation'
          href={url}
          title={props.title}
          target='_blank'
          rel='noopener,nofollow'
          tabindex={1}
          className='overlay-link'>Open {props.title} in new tab</a>
      </div>
    </Card>
  )
}
