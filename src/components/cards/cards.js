import React from 'react'
import { motion } from 'framer-motion'
import { Card, Elevation } from '@blueprintjs/core'
import { useLogger, useToggle } from 'react-use'


const variants = {
  open: {
    y: 0,
    opacity: 1,
    scaleY: 1,
  },
  closed: {
    y: -50,
    opacity: 0,
    scaleY: 1.2,
  },
}


export const HookedCard = ({ isOpen, children, ...props }) => {
  useLogger('HookedCard')

  return (
    <motion.div initial='closed' animate={ isOpen ? 'open' : 'closed' } variants={variants}>
      <Card {...props}>
        {children}
      </Card>
    </motion.div>
  )
}
