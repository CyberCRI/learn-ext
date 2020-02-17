import React, { useState } from 'react'
import { createEvent, createStore, createApi } from 'effector'
import { useStore } from 'effector-react'
import { Button, ButtonGroup, Divider } from '@blueprintjs/core'
import { Popover, Menu, Dialog } from '@blueprintjs/core'
import { motion } from 'framer-motion'
import _ from 'lodash'

import { i18n } from '@ilearn/modules/i18n'
import { ResourceCollectionView } from '~components/resources'
import { ConceptList } from '~components/concepts'
import { selectedConcepts, matchingResourceSet, matchingConceptSet } from './store'
import { pickLayer, resourcesDomain } from './store'

const overlayControlVariants = {
  open: {
    height: 'auto',
    opacity: 1,
  },
  closed: {
    height: 0,
    opacity: 0,
  },
}

const hotkeysDialogState = createStore(false)
const hotkeysDialog = createApi(hotkeysDialogState, {
  open: () => true,
  close: () => false,
})

export const MapKeyboardShortcutsDialog = (props) => {
  const isOpen = useStore(hotkeysDialogState)
  return (
    <Dialog
      isOpen={isOpen}
      title='Keyboard Shortcuts'
      icon='key-command'
      onClose={() => hotkeysDialog.close()}>
      <div>
        <ul>
          <li><kbd>↑</kbd> <kbd>↓</kbd> <kbd>→</kbd> <kbd>←</kbd> Move Around</li>
          <li><kbd>w</kbd> <kbd>s</kbd> <kbd>d</kbd> <kbd>a</kbd></li>
          <li><kbd>shift ↑</kbd> Zoom Out</li>
          <li><kbd>shift ↓</kbd> Zoom In</li>
        </ul>
      </div>
    </Dialog>
  )
}

export const MapDropdownMenuContent = (props) => {
  return (
    <Menu>
      <Menu.Item
        icon='key-command'
        text='Keyboard Shortcuts'
        onClick={() => hotkeysDialog.open()}/>
      <Menu.Item
        icon='lightbulb'
        text='Using Discover Map'/>
      <Menu.Item
        icon='code-block'
        text='About DotAtlas'
        target='_blank'
        href='https://get.carrotsearch.com/dotatlas/latest/'/>
    </Menu>
  )
}

export const MapDropdownMenu = () => {
  return (
    <Popover position='bottom'>
      <Button minimal icon='more'/>
      <div>
        <MapDropdownMenuContent/>
      </div>
    </Popover>
  )
}

export const LayerSelection = (props) => {
  const i18nT = i18n.context('pages.discover.sections.atlas.layers')
  const layerDomain = useStore(resourcesDomain)
  const layerChoices = [
    { key: 'user', icon: 'layout-circle' },
    { key: 'group', icon: 'layout-group-by' },
    { key: 'everything', icon: 'layout-sorted-clusters' },
  ]

  return (
    <div className='overlay tools'>
      <div>
      </div>
      <div>
        <ButtonGroup alignText='center' minimal className='layers'>
          {layerChoices.map(({ key, icon }) => (
            <Button
              key={key}
              icon={icon}
              text={i18nT(key)}
              active={key === layerDomain}
              onClick={() => pickLayer(key)}/>
          ))}
        </ButtonGroup>
      </div>
      <div>
        <MapDropdownMenu/>
        <MapKeyboardShortcutsDialog/>
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
  const [ isOpen, setPanelVisibility ] = useState(false)

  const label = conceptList.size ? `Concepts (${conceptList.size})` : 'Concepts'

  return (
    <motion.div
      className='overlay concepts'
      initial='closed'
      animate={isOpen ? 'open' : 'closed'}>

      <div className='controls'>
        <Button
          text={label}
          rightIcon={isOpen ? 'chevron-down' : 'chevron-up'}
          className='collapse'
          small
          fill
          minimal
          onClick={() => setPanelVisibility(!isOpen)}/>
      </div>

      <motion.div className='region' variants={overlayControlVariants}>
        <div>
          {!conceptList.size && <p>Pick a region on the map to show concepts</p>}
          {!!conceptList.size && <p>Showing resources matching {conceptList.size} concepts</p>}

          <ConceptList concepts={conceptList.toJS()}/>
        </div>
      </motion.div>
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
