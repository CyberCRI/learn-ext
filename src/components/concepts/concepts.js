import React from 'react'
import { useLogger } from 'react-use'
import _ from 'lodash'
import { Tag, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core'
import posed, { PoseGroup } from 'react-pose'

import { WikiCard } from '~components/cards'

const FluidTag = posed.li({
  exit: {
    opacity: 0,
    x: -30,
    scale: .2,
  },
  enter: {
    opacity: 1,
    x: 0,
    scale: 1,
  },
  flip: {
    transition: 'tween',
  },
})

const FluidTagList = posed.ul({
  exit: {
    opacity: 0,
  },
  enter: {
    opacity: 1,
    staggerChildren: 100,
  },
})

// > How should we sort the ConceptList entries?
// Each [key, order] pair defines the sort rule for a key and direction,
// the order of the sort rules are important -- they determine the priority
// while sorting.
// Note that there's no change if a key is missing, it should still result a
// stable sort order!
const ListSortOrderPriority = (() => {
  const keyProps = [
    [ 'similarity_score', 'desc' ],
    [ 'elo', 'desc' ],
    [ 'trueskill.sigma', 'asc' ],
    [ 'title', 'asc' ],
    [ 'title_en', 'asc' ],
    [ 'title_fr', 'asc' ],
  ]
  return _.unzip(keyProps)
})()


export const ConceptTag = (props) => {
  const { title, lang } = props
  const didClickRemove = () => {
    console.log(`[ConceptTag] Removing <${title}>`)
    props.onRemove && props.onRemove({ title })
  }

  const onRemove = props.removable === true ? didClickRemove : null
  const eloScore = props.elo ? `(${props.elo})` : ''

  useLogger('ConceptTag')

  return (
    <Tag
      interactive
      minimal
      large
      className='np--concept-tag'
      onRemove={onRemove}>
      <Popover
        content={<WikiCard title={title} lang={lang}/>}
        target={<span>{title} {eloScore}</span>}
        interactionKind={PopoverInteractionKind.HOVER}
        hoverCloseDelay={500}
        hoverOpenDelay={200}
        inheritDarkTheme={false}
        position={Position.LEFT_TOP}/>
    </Tag>
  )
}

export const ConceptList = (props) => {
  const { lang, removable=false } = props
  const concepts = _(props.concepts)
    .orderBy(...ListSortOrderPriority)
    .value()

  return (
    <PoseGroup initialPose='exit' pose='enter'>
      <FluidTagList className='np--concepts-list' key='fltag'>
        {concepts.map((item) =>
          <FluidTag key={item.title}>
            <ConceptTag
              removable={removable}
              onRemove={props.onRemove}
              lang={lang}
              {...item}/>
          </FluidTag>
        )}
      </FluidTagList>
    </PoseGroup>
  )
}
