import React from 'react'
import { Button, ControlGroup, Popover, InputGroup, Divider, ButtonGroup } from '@blueprintjs/core'
import { useToggle } from 'react-use'
import { useStore } from 'effector-react'
import styled from 'styled-components'

import { i18n } from '@ilearn/modules/i18n'
import { $globalContext } from '~page-commons/store'

import DPadButtons from './dpad-zoom'
import { MapLayerSources } from './consts'
import { didPickLayer, $layerSource } from './store'


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


  const shareUrlFragment = document.location.toString()

  return (
    <div className='widget sharing'>
      <Popover position='bottom' isOpen={visible} onClose={() => setVisibility(false)}>
        <Button icon='share' onClick={setVisibility} active={visible}>Share</Button>
        <SharingPopoverContainer>
          <h4>Share your map and selections</h4>
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

    if (node.user.groups.length > 0) {
      // [!todo] support more than 1 group.
      const group = node.user.groups[0]

      userLayers.push({
        id: 'group',
        label: i18nT`group`,
        src: `${group.guid}@group`,
        icon: 'layout-group-by',
        user: true,
      })
    }
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

export const SearchWidget = (props) => {
  return (
    <div className='widget search'>
      <InputGroup leftIcon='search' rightElement={<Button/>}/>
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
