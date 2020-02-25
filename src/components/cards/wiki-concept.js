import React from 'react'
import { Card, Elevation, AnchorButton, ButtonGroup, NonIdealState } from '@blueprintjs/core'
import { useAsync } from 'react-use'
import { FaWikipediaW } from 'react-icons/fa'

import Wiki from '~mixins/wikipedia'
import { i18n } from '@ilearn/modules/i18n'

const i18nT = i18n.context('components.cards.wikiInfoCard')

const skeletonFiller = (count=1) => {
  // Some text to fill in the elements inside the skeleton.
  // Use count to get words.
  const fillerWords = ['we', 'boop', 'kittens', 'and', 'doges']
  const filler = (i) => fillerWords[i % fillerWords.length]
  return (
    <span className='skels' role='presentation'>
      {Array(count).fill().map((i) =>
        <span className='skel' key={i}>{`${filler(i)} `}</span>
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
      icon='offline'
      description={i18nT('errorState.description')}
      className='reason'/>
  </Card>
)

export const PageInfoCard = (props) => (
  <Card interactive elevation={Elevation.TWO} className='bp3-dark info-card'>
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
          text={i18nT('actions.locateInMap')}
          href='#'/>
        <AnchorButton
          icon={<FaWikipediaW/>}
          rightIcon='arrow-top-right'
          text={i18nT('actions.moreInfo')}
          href={props.url}
          target='_blank'/>
      </ButtonGroup>
    </div>
  </Card>
)


const WikiCard = (props) => {
  const pageInfo = useAsync(async () => {
    return await Wiki.summary(props.title, props.lang)
  }, [])

  if (pageInfo.loading) {
    return <SkeletonCard/>
  } else if (pageInfo.error) {
    return <ErrorCard/>
  }

  return <PageInfoCard {...pageInfo.value}/>
}


export { WikiCard }
