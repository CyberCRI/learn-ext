import React from 'react'
import styled from 'styled-components'
import { Button, ButtonGroup } from '@blueprintjs/core'

const DPad = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 10px 20px;
`

export const useMapTransforms = () => {
  const mapt = () => window._magic_atlas.mapt
  return {
    zoom: {
      in:  () => mapt().zoom += 1,
      out: () => mapt().zoom -= 1,
    },
    nudge: {
      left:   () => mapt().x += 1,
      right:  () => mapt().x -= 1,
      down:   () => mapt().y += 1,
      up:     () => mapt().y -= 1,
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
