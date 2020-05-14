import React from 'react'
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
    transition: { staggerChildren: .8 },
  },
}

const PREF_LANG = 'en'


function getTagRepresentation (props) {
  // If we can find a representation in preferred language, great!
  // else we'd fall back to first available representation.
  // Note that if no representations are available it'd be an error.
  // I don't care about it right now.
  // Edit: I care now.
  const reprs = props.representations
  if (!reprs) {
    // Alternatively, we could have the values "baked in".
    // We only care about the property having `title_$lang` pattern.
    for (let lang of ['en', 'fr', 'es']) {
      let title = props[`title_${lang}`]
      if (title) {
        return { title, lang }
      }
    }
    return {} // we can't do anything but ignore.
  }
  const r = reprs.find(node => node.lang === PREF_LANG)
  if (typeof r !== 'object') {
    return reprs[0]
  }
  return r
}

export const ConceptTag = (props) => {
  const { wikidata_id } = props
  const { title, lang } = getTagRepresentation(props)
  if (!title || !lang) {
    console.log(`Empty tag. Not rendering <ConceptTag ${wikidata_id}>`)
    return null
  }

  const didClickRemove = () => {
    console.debug(`[ConceptTag] Removing <${title}>`)
    props.onRemove && props.onRemove({ title, wikidata_id })
  }

  const onRemove = props.removable === true ? didClickRemove : null

  return (
    <Tag
      interactive
      minimal
      large
      className='np--concept-tag concept tag'
      onRemove={onRemove}>
      <Popover
        content={<WikiCard title={title} lang={lang}/>}
        target={<span>{title}</span>}
        interactionKind={PopoverInteractionKind.HOVER}
        popoverClassName='wiki-popover'
        hoverCloseDelay={500}
        hoverOpenDelay={200}
        inheritDarkTheme={true}
        boundary='viewport'
        position={Position.BOTTOM}/>
    </Tag>
  )
}

export const ConceptList = (props) => {
  const { removable=false } = props
  const concepts = props.concepts

  return (
    <AnimatePresence initial={props.noAnimation ? false : 'hidden'}>
      <motion.ul
        initial='hidden'
        animate='visible'
        exit='hidden'
        variants={conceptListVariants}
        className='np--concepts-list concept list'>
        {concepts.map((item) =>
          <motion.li key={item.wikidata_id} positionTransition variants={conceptVariants}>
            <ConceptTag
              removable={removable}
              onRemove={props.onRemove}
              {...item}/>
          </motion.li>
        )}
      </motion.ul>
    </AnimatePresence>
  )
}

export const ConceptListLoadingState = ({ nconcepts=5, ...props }) => {
  const concepts = Array(nconcepts).fill().map((_, i) => ({
    key: i,
    label: 'Kitties are so cute!'.slice(Math.floor(Math.random() * 5)),
  }))
  return (
    <AnimatePresence initial='hidden'>
      <motion.ul
        initial='hidden'
        animate='visible'
        exit='hidden'
        variants={conceptListVariants}
        className='np--concepts-list concept list'>
        {concepts.map((item) =>
          <motion.li key={item.key} positionTransition variants={conceptVariants}>
            <Tag minimal large className='np--concept-tag concept tag bp3-skeleton'>
              <span>{item.label}</span>
            </Tag>
          </motion.li>)}
      </motion.ul>
    </AnimatePresence>
  )
}
