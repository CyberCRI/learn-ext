import React from 'react'

import { setupInstance } from './renderer'
import { OverlayCards } from './overlays'

const DiscoverView = () => {
  return (
    <div className='discover'>
      <h1>Browse Resources on Map</h1>
      <OverlayCards />
    </div>
  )
}

export { DiscoverView, setupInstance }
