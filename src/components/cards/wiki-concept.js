import React, { useState, useEffect } from 'react'
import { useEffectOnce } from 'react-use'
import { Card, Elevation, AnchorButton, ButtonGroup, NonIdealState } from '@blueprintjs/core'
import { FaWikipediaW, FaBandAid } from 'react-icons/fa'
import clsx from 'classnames'
import _ from 'lodash'

import Wiki from '~mixins/wikipedia'


const skeletonFiller = (count = 1) => {
  // Some text to fill in the elements inside the skeleton.
  // Use count to get words.
  const fillers = ['we', 'boop', 'kittens', 'and', 'doges']
  return (
    <span className='skels'>
      {_.range(count).map((i) =>
        <span className='skel' key={i}>{`${_.sample(fillers)} `}</span>
      )}
    </span>
  )
}

export const SkeletonCard = () => (
  <Card elevation={Elevation.TWO} className='info-card skeleton'>
    <div className='content'>
      <h3 className='title'>{skeletonFiller(3)}</h3>
      <p className='summary'>{skeletonFiller(20)}</p>
    </div>
    <div className='tools'>
    </div>
  </Card>
)

export const ErrorCard = () => (
  <Card className='info-card error bp3-dark'>
    <NonIdealState
      icon={<FaBandAid/>}
      description='Wikipedia does not seem to have a page for this concept.'
      className='reason'/>
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
          href='#'/>
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
    Wiki.summary(props.title, props.lang)
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
