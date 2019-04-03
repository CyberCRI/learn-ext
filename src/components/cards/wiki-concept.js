import React, { useState, useEffect } from 'react'
import { useEffectOnce } from 'react-use'
import { Card, Elevation, AnchorButton, ButtonGroup, NonIdealState } from '@blueprintjs/core'
import { FaWikipediaW, FaBandAid } from 'react-icons/fa'
import clsx from 'classnames'
import _ from 'lodash'

import Wiki from '~mixins/wikipedia'


export const SkeletonCard = () => (
  <Card interactive elevation={Elevation.TWO} className='info-card'>
    <h3 role='title' className='bp3-skeleton'>Boop</h3>
    <p role='text'>
      {_.range(20).map((i) =>
        <span className='bp3-skeleton' key={i}>Boop </span>
      )}
    </p>
    <div role='image' className='bp3-skeleton'/>
  </Card>
)

export const ErrorCard = () => (
  <Card className='info-card bp3-dark'>
    <NonIdealState
      icon={<FaBandAid/>}
      description='Wikipedia seems to not have any page for this concept.'/>
  </Card>
)

export const PageInfoCard = (props) => (
  <Card interactive elevation={Elevation.TWO} className={clsx('info-card', 'bp3-dark')}>
    <div className='content'>
      <h3 className='title'>
        {props.title}
      </h3>
      <p className='summary'>{props.extract}</p>
    </div>
    {props.thumbnail && <img className='thumbnail' src={props.thumbnail}/>}
    <div className='tools'>
      <ButtonGroup fill minimal>
        <AnchorButton
          icon='send-to-map'
          text='Locate in Map'
          href='#'
          target='_blank'/>
        <AnchorButton
          icon={<FaWikipediaW/>}
          rightIcon='arrow-top-right'
          text='Read more'
          href={props.url}
          target='_blank'/>
      </ButtonGroup>
    </div>
  </Card>
)


const WikiCard = (props) => {
  const [ pageInfo, setPageInfo ] = useState(null)

  useEffectOnce(() => {
    Wiki.summary(props.title)
      .then(setPageInfo)
      .fail(() => setPageInfo({ error: true }))
  })

  if (!pageInfo) {
    return <SkeletonCard />
  }

  if (pageInfo.error) {
    return <ErrorCard />
  }

  return <PageInfoCard {...pageInfo}/>
}


export { WikiCard }
