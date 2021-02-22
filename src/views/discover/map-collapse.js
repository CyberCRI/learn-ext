import React from 'react'
import { Button } from '@blueprintjs/core'
import { useToggle } from 'react-use'

export const MapCollapseButton = () => {
  const [visible, toggleVisibility] = useToggle(true)

  const didClickOnButton = () => {
    // Mutating an element outside the react root.
    const el = document.querySelector('#map-container')
    el.classList.toggle('collapsed')
    toggleVisibility()
  }
  return <Button
    text={visible ? 'Collapse Map' : 'Show Map'}
    onClick={didClickOnButton}/>
}
