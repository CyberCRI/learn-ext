import React, { useState } from 'react'
import { useStore } from 'effector-react'
import { Button, ButtonGroup, Divider } from '@blueprintjs/core'
import { motion } from 'framer-motion'
import _ from 'lodash'

import { i18n } from '@ilearn/modules/i18n'
import { ResourceCollectionView } from '~components/dashboard'
import { ConceptList } from '~components/concepts'
import { selectedConcepts, matchingResourceSet, matchingConceptSet } from './store'


const overlayControlVariants = {
  open: {
    x: 0,
    scaleX: 1,
    opacity: 1,
  },
  closed: {
    x: '-100%',
    scaleX: 0,
    opacity: 0,
  },
}

export const LayerSelection = (props) => {
  const i18nT = i18n.context('pages.discover.sections.atlas.layers')
  return (
    <div className='overlay tools'>
      <div>
      </div>
      <div>
        <ButtonGroup alignText='center' minimal className='layers'>
          <Button icon='layout-circle' active text={i18nT('user')}/>
          <Button icon='layout-group-by' text={i18nT('group')}/>
          <Button icon='layout-sorted-clusters' text={i18nT('everything')}/>
        </ButtonGroup>
      </div>
      <div>
        <Button icon='more' minimal/>
      </div>
    </div>
  )
}

export const OverlayTools = (props) => {
  return (
    <div>
      <LayerSelection/>
    </div>
  )
}

export const OverlayConcepts = (props) => {
  const conceptList = useStore(selectedConcepts)
  const [ isOpen, setPanelVisibility ] = useState(true)

  return (
    <motion.div
      className='overlay concepts'
      initial='closed'
      animate={isOpen ? 'open' : 'closed'}
      variants={overlayControlVariants}>

      {!conceptList.size && <p>Pick a region on the map to show concepts</p>}
      {!!conceptList.size && <p>Showing resources matching {conceptList.size} concepts</p>}
      <ConceptList concepts={conceptList.toJS()}/>
    </motion.div>
  )
}

export const OverlayCards = (props) => {
  const matchingResources = useStore(matchingResourceSet)

  if (!matchingResources.length) {
    return (
      <div className='empty'>
        <h2>Browse resources on map</h2>
        <p>Pick a region (or several) by clicking on the map. You can refine your
        selection by zooming in, and select several regions by holding <kbd>shift</kbd>
        while clicking.</p>
      </div>
    )
  }

  return (
    <div className='matches'>
      <p>Showing {matchingResources.length} resources</p>
      <ResourceCollectionView resources={matchingResources} skipConceptList/>
    </div>
  )
}
