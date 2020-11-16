import React from 'react'
import { ShareButton, LayerPicker, ZoomButtons } from './widgets'


export const OverlayTools = (props) => {
  return (
    <>
      <LayerPicker/>
      <ShareButton/>
      <ZoomButtons/>
    </>
  )
}
