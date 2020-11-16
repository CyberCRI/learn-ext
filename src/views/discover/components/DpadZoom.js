import React from 'react'
import { Button, ButtonGroup } from '@blueprintjs/core'

import { viewportEvent } from '../store'


export const useMapTransforms = () => {
  return {
    zoom: {
      in:  () => viewportEvent.zoom('in'),
      out: () => viewportEvent.zoom('out'),
    },
    nudge: {
      left:   () => viewportEvent.nudge('lt'),
      right:  () => viewportEvent.nudge('rt'),
      down:   () => viewportEvent.nudge('dn'),
      up:     () => viewportEvent.nudge('up'),
    },
  }
}

export const ZoomButtons = (props) => {
  const mapt = useMapTransforms()
  return <div className='widget dpad'>
    <ButtonGroup vertical>
      <Button icon='plus' onClick={mapt.zoom.in}/>
      <Button icon='minus' onClick={mapt.zoom.out}/>
    </ButtonGroup>
  </div>
}
