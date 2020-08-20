import React, { useState } from 'react'
import { createStore, createApi } from 'effector'
import { useStore } from 'effector-react'
import { Button, ButtonGroup, InputGroup, Divider, ControlGroup } from '@blueprintjs/core'
import { Popover, Menu, Dialog } from '@blueprintjs/core'
import { motion } from 'framer-motion'
import { useToggle } from 'react-use'
import queryStrings from 'query-string'
import styled from 'styled-components'
import _ from 'lodash'

import { i18n } from '@ilearn/modules/i18n'
import { ConceptList } from '~components/concepts'
import { $globalContext } from '~page-commons/store'
import DPadButtons from './dpad-zoom'

import { MapLayerSources } from './consts'
import { selectedConcepts } from './store'
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
    <ControlGroup fill={true}>
      <InputGroup
        readOnly
        value={text}
        onClick={didClipText}
        rightElement/>
      <Button
        icon='text-highlight'
        intent='primary'
        onClick={didClipText}
        text='Copy Link'
        style={{flexGrow: 0}}/>
    </ControlGroup>
  )
}

const SharingPopoverContainer = styled.div`
  padding: 5px 10px;
`

export const ShareButton = (props) => {
  const [ visible, setVisibility ] = useToggle(false)
  let canvasImg
  let transform = {}

  if (typeof window._magic_atlas === 'object') {
    canvasImg = window._magic_atlas.get('imageData')
    transform = window._magic_atlas.mapt.centerPoint
  }

  const shareUrlFragment = document.location.toString()

  return (
    <div className='widget sharing'>
      <Popover position='bottom' isOpen={visible} onClose={() => setVisibility(false)}>
        <Button icon='share' onClick={setVisibility} active={visible}>Share</Button>
        <SharingPopoverContainer>
          <h4>Share your map and selections</h4>
          <div className='state'>
            {canvasImg && <img src={canvasImg}/>}
          </div>
          <div>
            <p>Use the link below to share your map.</p>
            <ClipboardTextBox text={shareUrlFragment}/>
          </div>
        </SharingPopoverContainer>
      </Popover>
    </div>
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
      src: node.user.email,
      icon: 'layout-circle',
      user: true,
    })

    // if (node.user.groups.length > 0) {
    //   // [!todo] support more than 1 group.
    //   const group = node.user.groups[0]

    //   userLayers.push({
    //     id: 'group',
    //     label: i18nT`group`,
    //     src: `/api/resources/group/${group.guid}`,
    //     icon: 'layout-group-by',
    //   })
    // }
  }

  return (
    <div className='widget layers'>
      <h5>Featured Maps</h5>
      <Divider/>
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
  )
}

export const OverlayTools = (props) => {
  return (
    <>
      <LayerSelection/>
      <ShareButton/>
      <DPadButtons/>
    </>
  )
}

export const OverlayConcepts = (props) => {
  const conceptList = useStore(selectedConcepts)
  const [ isOpen, setPanelVisibility ] = useState(true)

  const label = conceptList.length ? `Concepts (${conceptList.length})` : 'Concepts'

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
          {!conceptList.length && <p>Pick a region on the map to show concepts</p>}
          {!!conceptList.length && <p>Showing resources matching {conceptList.length} concepts</p>}

          {isOpen && <ConceptList concepts={conceptList} noAnimation/>}
        </div>
      </motion.div>
    </motion.div>
  )
}
