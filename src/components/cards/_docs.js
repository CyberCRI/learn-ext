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

export const resourceDataSample = {
  concepts: [
    {
      title_en: 'Weak heap',
      relScore: 2.324,
      elo: 1000,
    },
    {
      title_en: 'WAVL tree',
      relScore: 2.336,
      elo: 1000,
    },
    {
      title_en: 'Binary tree',
      relScore: 2.348,
      elo: 1000,
    },
    {
      title_en: 'Linked list',
      relScore: 2.388,
      elo: 1000,
    },
    {
      title_en: 'Binary search tree',
      relScore: 2.4,
      elo: 1000,
    },
  ],
  recorded_on: '2019-05-02T15:50:23.491912',
  lang: 'en',
  title: 'Node.appendChild() - Web APIs | MDN',
  url: 'https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild',
}

export { WikiPopoverCard }
