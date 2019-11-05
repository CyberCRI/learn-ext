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
    const { naturalWidth, height } = e.target
    if (naturalWidth < 160) {
      setDisplay({ hidden: true })
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
        <DateTimePill timestamp={props.created_on}/>

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
      </div>
    </Card>
  )
}
