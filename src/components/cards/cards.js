import React from 'react'
import posed from 'react-pose'
import { Card, Elevation } from '@blueprintjs/core'
import { useLogger, useToggle } from 'react-use'


const CardBox = posed.div({
  open: {
    y: 0,
    opacity: 1,
    scaleY: 1,
    filter: 'blur(0px)',
    // flip: true,
    staggerChildren: 100,
    beforeChildren: true,
    transition: {
      y: { type: 'spring', stiffness: 1000, damping: 25 },
      default: { duration: 200 },
    },
    applyAtStart: { display: 'block' },
  },
  closed: {
    y: -50,
    opacity: 0,
    filter: 'blur(10px)',
    scaleY: 1.2,
    // flip: true,
    afterChildren: true,
    staggerChildren: 100,
    transition: { duration: 200 },
    applyAtEnd: { display: 'none' },
  },
})

export const HookedCard = ({ isOpen, children, ...props }) => {
  useLogger('HookedCard')

  return (
    <CardBox pose={isOpen ? 'open' : 'closed'}>
      <Card {...props}>
        {children}
      </Card>
    </CardBox>
  )
}
