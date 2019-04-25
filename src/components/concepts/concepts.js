import React from 'react'
import { useLogger } from 'react-use'
import { Tag, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core'
import posed, { PoseGroup } from 'react-pose'

import { WikiCard } from '~components/cards'

import './styles.sass'


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


export const ConceptTag = (props) => {
  const { title, lang } = props
  const didClickRemove = () => {
    console.log(`[ConceptTag] Removing <${title}>`)
    props.onRemove && props.onRemove({ title })
  }

  useLogger('ConceptTag')

  return (
    <Tag
      interactive
      minimal
      large
      className='np--concept-tag'
      onRemove={didClickRemove}>
      <Popover
        content={<WikiCard title={title} lang={lang}/>}
        target={<span>{title}</span>}
        interactionKind={PopoverInteractionKind.HOVER}
        hoverCloseDelay={500}
        hoverOpenDelay={200}
        inheritDarkTheme={false}
        position={Position.LEFT_TOP}/>
    </Tag>
  )
}

export const ConceptList = (props) => {
  const { concepts, lang } = props
  useLogger('ConceptList')

  return (
    <PoseGroup initialPose='exit' pose='enter'>
      <FluidTagList className='np--concepts-list' key='fltag'>
        {concepts.map((item) =>
          <FluidTag key={item.title}>
            <ConceptTag onRemove={props.onRemove} lang={lang} {...item}/>
          </FluidTag>
        )}
      </FluidTagList>
    </PoseGroup>
  )
}
