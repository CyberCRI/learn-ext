import React from 'react'
import { LayerPicker, ZoomButtons, MapToolBar } from './widgets'


export const OverlayTools = (props) => {
  return (
    <>
      <LayerPicker/>
      <ZoomButtons/>
      <MapToolBar/>
    </>
  )
}
