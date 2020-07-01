import React from 'react'
import styled from 'styled-components'
import { Button, ButtonGroup } from '@blueprintjs/core'

import { viewportEvent } from './store'

const DPad = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 10px 20px;
`

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
  return <ButtonGroup vertical>
    <Button icon='plus' onClick={mapt.zoom.in}/>
    <Button icon='minus' onClick={mapt.zoom.out}/>
  </ButtonGroup>
}

export default function DPadButtons (props) {
  return <DPad>
    <ZoomButtons/>
  </DPad>
}
