import React, { useState, useEffect } from 'react'
import { Card, Elevation, AnchorButton, ButtonGroup } from '@blueprintjs/core'
import { FaWikipediaW } from 'react-icons/fa'
import clsx from 'classnames'
import _ from 'lodash'

import Wiki from '~mixins/wikipedia'


const SkeletonCard = () => (
  <Card interactive elevation={Elevation.TWO} className='info-card'>
    <h3 role='title' className='bp3-skeleton'>Boop</h3>
    <p role='text'>
      {_.range(20).map(() =>
        <span className='bp3-skeleton'>Boop </span>
      )}
    </p>
    <div role='image' className='bp3-skeleton'/>
  </Card>
)


const WikiCard = (props) => {
  const [ pageInfo, setPageInfo ] = useState(null)

  if (!pageInfo) {
    Wiki.summary(props.title)
      .then((data) => {
        setPageInfo(data)
      })
  }

  if (!pageInfo) {
    return <SkeletonCard />
  }

  const contentUrl = pageInfo.content_urls.desktop.page

  return (
    <Card interactive elevation={Elevation.TWO} className={clsx('info-card', 'bp3-dark')}>
      <div className='content'>
        <h3 className='title'>
          {pageInfo.title}
          <cite>From Wikipedia</cite>
        </h3>
        <p className='summary'>{pageInfo.extract}</p>
      </div>
      {pageInfo.thumbnail && <img className='thumbnail' src={pageInfo.thumbnail.source}/>}
      <div className='tools'>
        <ButtonGroup fill minimal>
          <AnchorButton
            icon='send-to-map'
            text='Locate in Map'
            href={contentUrl}
            target='_blank'/>
          <AnchorButton
            rightIcon='arrow-top-right'
            text='Read more'
            href={contentUrl}
            target='_blank'/>
        </ButtonGroup>
      </div>
    </Card>
  )
}


export { WikiCard }
