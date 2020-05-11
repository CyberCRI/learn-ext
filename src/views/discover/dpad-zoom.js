import React from 'react'
import styled from 'styled-components'
import { Button } from '@blueprintjs/core'

const DPadBox = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  display: grid;

  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 5px 1fr 1fr 1fr;
  gap: 0 0;
  grid-template-areas:
    ".  zp  ."
    ".  zm  ."
    ".  .   ."
    ".  up  ."
    "lt .   rt"
    ".  dn  .";
`

const Nudge = {
  left: styled.div`grid-area: lt;`,
  right: styled.div`grid-area: rt;`,
  up: styled.div`grid-area: up;`,
  down: styled.div`grid-area: dn;`,
  zoomIn: styled.div`grid-area: zp;`,
  zoomOut: styled.div`grid-area: zm;`,
}


export default function DPadButtons(props) {
  const didClick = (axis, delta) => () => {
    window._magic_atlas.mapt[axis] += delta
  }

  return <DPadBox>
    <Nudge.right>
      <Button
        onClick={didClick('x', -1)}
        outlined
        icon='chevron-right'/>
    </Nudge.right>
    <Nudge.left>
      <Button
        onClick={didClick('x', 1)}
        outlined
        icon='chevron-left'/>
    </Nudge.left>
    <Nudge.up>
      <Button
        onClick={didClick('y', -1)}
        outlined
        icon='chevron-up'/>
    </Nudge.up>
    <Nudge.down>
      <Button
        onClick={didClick('y', 1)}
        outlined
        icon='chevron-down'/>
    </Nudge.down>
    <Nudge.zoomIn>
      <Button
        onClick={didClick('zoom', 1)}
        outlined
        icon='plus'/>
    </Nudge.zoomIn>
    <Nudge.zoomOut>
      <Button
        onClick={didClick('zoom', -1)}
        outlined
        icon='minus'/>
    </Nudge.zoomOut>
  </DPadBox>
}
