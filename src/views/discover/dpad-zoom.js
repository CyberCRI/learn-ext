import React from 'react'
import styled from 'styled-components'

const DPadBox = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
`
const DirectionalButton = styled.button``

export default function DPadButtons(props) {
  const didClick = (axis, delta) => () => {
    window._magic_atlas.mapt[axis] += delta
  }

  return <DPadBox>
    <DirectionalButton onClick={didClick('x', -1)}>Left</DirectionalButton>
    <DirectionalButton onClick={didClick('x', 1)}>Right</DirectionalButton>
    <DirectionalButton onClick={didClick('y', -1)}>Up</DirectionalButton>
    <DirectionalButton onClick={didClick('y', 1)}>Down</DirectionalButton>
    <DirectionalButton onClick={didClick('zoom', 1)}>Zoom In</DirectionalButton>
    <DirectionalButton onClick={didClick('zoom', -1)}>Zoom Out</DirectionalButton>
  </DPadBox>
}
