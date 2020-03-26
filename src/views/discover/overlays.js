import React, { useState } from 'react'
import { createStore, createApi } from 'effector'
import { useStore } from 'effector-react'
import { Button, ButtonGroup, InputGroup, Divider } from '@blueprintjs/core'
import { Popover, Menu, Dialog } from '@blueprintjs/core'
import { motion } from 'framer-motion'
import queryStrings from 'query-string'
import _ from 'lodash'

import { i18n } from '@ilearn/modules/i18n'
import { ResourceCollectionView } from '~components/resources'
import { ConceptList } from '~components/concepts'
import { $globalContext } from '~page-commons/store'

import { MapLayerSources } from './consts'
import { selectedConcepts, userResources } from './store'
import { didPickLayer, $layerSource } from './store'

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
          <li><kbd>d e v</kbd> Toggle Map Parameter Editor</li>
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
      <Button icon='more'/>
      <div>
        <MapDropdownMenuContent/>
      </div>
    </Popover>
  )
}

export const ClipboardTextBox = ({ text }) => {
  const didClipText = () => window.navigator.clipboard.writeText(text)
  return (
    <InputGroup
      readOnly
      value={text}
      rightElement={<Button icon='text-highlight' onClick={didClipText}/>}/>
  )
}

export const ShareButton = (props) => {
  const selection = useStore(selectedConcepts)
  const currentLayer = useStore($layerSource)

  const shareUrlFragment = queryStrings.stringifyUrl({
    url: document.location.href,
    query: {
      lid: currentLayer.id,
      src: currentLayer.src,
      cset: selection.map((s) => s.wikidata_id).toJS(),
    },
  }, { arrayFormat: 'comma' })

  return (
    <Popover position='bottom'>
      <Button icon='share'>Share</Button>
      <div>
        <h4>Share your map and selections</h4>
        <ClipboardTextBox text={shareUrlFragment}/>
      </div>
    </Popover>
  )
}

export const LayerSelection = (props) => {
  const i18nT = i18n.context('pages.discover.sections.atlas.layers')
  const node = useStore($globalContext)
  const currentLayer = useStore($layerSource)

  const userLayers = []

  if (node.authorized) {
    userLayers.push({
      id: 'user',
      label: i18nT`user`,
      src: `/api/resources/user/${node.user.uid}`,
      icon: 'layout-circle',
    })

    if (node.user.groups.length > 0) {
      // [!todo] support more than 1 group.
      const group = node.user.groups[0]

      userLayers.push({
        id: 'group',
        label: i18nT`group`,
        src: `/api/resources/group/${group.guid}`,
        icon: 'layout-group-by',
      })
    }
  }

  return (
    <div className='overlay tools'>
      <div>
        <h5>Topics</h5>
        <ButtonGroup vertical minimal className='layers'>
          {MapLayerSources.map((layer) => (
            <Button
              key={layer.id}
              icon={layer.icon}
              text={layer.label}
              active={layer.id === currentLayer.id}
              onClick={() => didPickLayer(layer)}/>
          ))}
          {userLayers.length > 0 && <Divider/>}
          {userLayers.map((layer) => (
            <Button
              key={layer.id}
              icon={layer.icon}
              text={layer.label}
              active={layer.id === currentLayer.id}
              onClick={() => didPickLayer(layer)}/>
          ))}
        </ButtonGroup>
      </div>
      <div>
        <ShareButton/>
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

const PlaceHolder = (props) => {
  return (
    <div className='empty'>
      <h2>Browse resources on map</h2>
      <p>Pick a region (or several) by clicking on the map. You can refine your
      selection by zooming in, and select several regions by holding <kbd>shift</kbd>
      while clicking.</p>
    </div>
  )
}

export const OverlayCards = (props) => {
  const resources = useStore(userResources)
  const selection = useStore(selectedConcepts)
  const selIx = new Set(selection.toJS().map((c) => c.wikidata_id))

  const matchingResources = resources.filter((r) => {
    for (let c of r.concepts) {
      if (selIx.has(c.wikidata_id)) {
        return true
      }
    }
  })

  const itemList = !matchingResources
    ? <PlaceHolder/>
    : <ResourceCollectionView resources={matchingResources}/>

  return (
    <div className='matches'>
      <p>there are {resources.length} resouces loaded</p>
      <p>...and {selection.size} nodes selected on map</p>
      <p>hence, showing {matchingResources.length} resources</p>
      {itemList}
    </div>
  )
}
