import React from 'react'
import _ from 'lodash'
import { Tag, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core'
import { motion, AnimatePresence } from 'framer-motion'

import { WikiCard } from '~components/cards'

const conceptVariants = {
  hidden: { x: -30, opacity: 0 },
  visible: { x: 0, opacity: 1 },
}

const conceptListVariants = {
  hidden: {
    transition: { staggerChildren: .8 },
  },
  visible: {
    transition: { staggerChildren: .2 },
  },
}


// > How should we sort the ConceptList entries?
// Each [key, order] pair defines the sort rule for a key and direction,
// the order of the sort rules are important -- they determine the priority
// while sorting.
// Note that there's no change if a key is missing, it should still result a
// stable sort order!
const ListSortOrderPriority = (() => {
  const keyProps = [
    [ 'title', 'asc' ],
    [ 'title_en', 'asc' ],
    [ 'title_fr', 'asc' ],
    [ 'similarity_score', 'desc' ],
    [ 'elo', 'desc' ],
    [ 'trueskill.sigma', 'asc' ],
  ]
  return _.unzip(keyProps)
})()


export const ConceptTag = (props) => {
  const { title, lang } = props
  const didClickRemove = () => {
    console.debug(`[ConceptTag] Removing <${title}>`)
    props.onRemove && props.onRemove({ title })
  }

  const onRemove = props.removable === true ? didClickRemove : null

  return (
    <Tag
      interactive
      minimal
      large
      className='np--concept-tag'
      onRemove={onRemove}>
      <Popover
        content={<WikiCard title={title} lang={lang}/>}
        target={<span>{title}</span>}
        interactionKind={PopoverInteractionKind.HOVER}
        popoverClassName='wiki-popover'
        hoverCloseDelay={500}
        hoverOpenDelay={200}
        inheritDarkTheme={true}
        boundary='window'
        position={Position.BOTTOM}/>
    </Tag>
  )
}

export const ConceptList = (props) => {
  const { lang, removable=false } = props
  const concepts = _(props.concepts)
    .orderBy(...ListSortOrderPriority)
    .filter((o) => o.title || o.title_en || o.title_fr)
    .value()

  return (
    <AnimatePresence initial={props.noAnimation ? false : 'hidden'}>
      <motion.ul
        initial='hidden'
        animate='visible'
        exit='hidden'
        variants={conceptListVariants}
        className='np--concepts-list'>
        {concepts.map((item) =>
          <motion.li key={item.title} positionTransition variants={conceptVariants}>
            <ConceptTag
              removable={removable}
              onRemove={props.onRemove}
              lang={lang}
              {...item}/>
          </motion.li>
        )}
      </motion.ul>
    </AnimatePresence>
  )
}
