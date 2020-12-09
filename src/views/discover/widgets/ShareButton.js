import React from 'react'
import { Button, ControlGroup, Popover, InputGroup } from '@blueprintjs/core'
import { useToggle } from 'react-use'
import styled from 'styled-components'

import { i18n } from '@ilearn/modules/i18n'


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
  )
}
