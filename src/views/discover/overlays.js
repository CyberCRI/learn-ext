import React, { useState } from 'react'
import { useStore } from 'effector-react'
import { Button, RadioGroup, Radio } from '@blueprintjs/core'
import { motion } from 'framer-motion'
import _ from 'lodash'

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

export const OverlayTools = (props) => {
  return (
    <div className='overlay tools'>
      <Button icon='menu-closed'/>
      <RadioGroup label='Show from resources:'>
        <Radio label='My Resources' value='user'/>
        <Radio label='My Group' value='group'/>
        <Radio label='All Resources' value='all'/>
      </RadioGroup>
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
