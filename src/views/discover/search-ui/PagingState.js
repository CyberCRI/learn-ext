import React from 'react'
import { Tag } from '@blueprintjs/core'

import { useStore } from 'effector-react'
import { $layerSource, $searchStateInternal } from '../store'

const LayerState = () => {
  const currentLayer = useStore($layerSource)
  if (!currentLayer.label) {
    return null
  }
  return <em>in {currentLayer.label}</em>
}

const HashtagState = () => {
  const state = useStore($searchStateInternal)
  if (state.hashtag) {
    return <Tag round minimal intent='primary'># {state.hashtag}</Tag>
  }
  return null
}

const ConceptState = () => {
  const state = useStore($searchStateInternal)
  if (state.concept) {
    return <Tag minimal icon={<span>CONCEPT |</span>}>{state.concept}</Tag>
  }
  return null
}

const PortalState = () => {
  const state = useStore($searchStateInternal)
  if (state.portal) {
    return <Tag minimal intent='success' icon={<span>FAMILY |</span>}>{state.portal}</Tag>
  }
  return null
}

const TextState = () => {
  const state = useStore($searchStateInternal)
  if (state.resultSearchTerm) {
    return <em>{state.resultSearchTerm}</em>
  }
  return null
}

const StateValues = () => {
  const state = useStore($searchStateInternal)
  const queryContainsAValue = ([
    !!state.hashtag,
    !!state.concept,
    !!state.portal,
    !!state.resultSearchTerm.trim(),
  ]).reduce((x, value) => x || value, false)

  const children = [
    <HashtagState key='hashtag'/>,
    <ConceptState key='concept'/>,
    <PortalState key='portal'/>,
    <TextState key='term'/>,
  ]

  return <>
    {queryContainsAValue && <span>for</span>}
    {' '}
    {children.map(c => c)}
  </>
}


const PagingState = ({ end, start, searchTerm, totalResults, ...props }) => {
  return (
    <div>
      Showing <strong>{start} - {end}</strong> out of <strong>{totalResults}</strong> <StateValues/> <LayerState/>
    </div>
  )
}

export default PagingState
