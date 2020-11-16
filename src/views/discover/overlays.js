import React from 'react'
import { ShareButton, LayerPicker, HashtagPicker, ZoomButtons } from './widgets'


export const OverlayTools = (props) => {
  return (
    <>
      <LayerPicker/>
      <HashtagPicker/>
      <ShareButton/>
      <ZoomButtons/>
    </>
  )
}
