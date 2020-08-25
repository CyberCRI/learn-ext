import React from 'react'
import { Button, ControlGroup, Popover } from '@blueprintjs/core'
import { useToggle } from 'react-use'
import styled from 'styled-components'

import DPadButtons from './dpad-zoom'


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

  if (typeof window._magic_atlas === 'object') {
    // this was used to make thing much prettier, but now needs a refresh!
    canvasImg = window._magic_atlas.get('imageData')
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

export const OverlayTools = (props) => {
  return (
    <>
      <ShareButton/>
      <DPadButtons/>
    </>
  )
}
