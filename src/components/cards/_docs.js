import React from 'react'
import { Popover, PopoverInteractionKind, Position } from '@blueprintjs/core'

import { WikiCard } from './wiki-concept'


const WikiPopoverCard = (props) => {
  return (
    <Popover
      content={<WikiCard title={props.label}/>}
      target={<span>{props.label}</span>}
      interactionKind={PopoverInteractionKind.HOVER}
      hoverCloseDelay={500}
      hoverOpenDelay={200}
      inheritDarkTheme={false}
      isOpen={true}
      usePortal={false}
      enforceFocus={false}
      position={Position.RIGHT}/>)
}

export { WikiPopoverCard }
