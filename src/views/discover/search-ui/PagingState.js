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

const SearchState = () => {
  const state = useStore($searchStateInternal)
  let element = null

  if (state.source === 'hashtag') {
    element = <Tag round minimal intent='primary'># {state.hashtag}</Tag>
  }
  if (state.source === 'concept') {
    element = <Tag minimal icon={<span>CONCEPT |</span>}>{state.term}</Tag>
  }
  if (state.source === 'portal') {
    element = <Tag minimal intent='success' icon={<span>FAMILY |</span>}>{state.term}</Tag>
  }
  if (state.source === 'text') {
    element = <em>{state.term}</em>
  }

  if (element) {
    return <><span>for </span>{element}</>
  }
  return null
}


const PagingState = ({ end, start, searchTerm, totalResults, ...props }) => {
  return (
    <div>
      Showing <strong>{start} - {end}</strong> out of <strong>{totalResults}</strong> <SearchState/> <LayerState/>
    </div>
  )
}

export default PagingState
