import React from 'react'

import { ShareButton } from './ShareButton'
import { MapHelpButton } from './MapHelpButton'

export const MapToolBar = (props) => {
  return <div className='widget toolbar'>
    <ShareButton/>
    <MapHelpButton/>
  </div>
}
