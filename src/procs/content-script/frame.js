import React, { useState } from 'react'
import { useMount } from 'react-use'
import { motion } from 'framer-motion'
import { Port } from '../portal'


const iframeVariants = {
  open: {
    opacity: 1,
    display: 'block',
  },
  closed: {
    opacity: 0,
    transitionEnd: { display: 'none' },
  },
}

// Inline iframe styles.
// [NOTE] To ensure the iframe is almost _always_ on top. We use a "safe" zIndex
// value (theoretically it's the max value possible).
const iFrameStyles = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100vw',
  height: '100vh',
  border: 'none',
  outline: 'none',
  pointerEvents: 'all',
  zIndex: 1992600322,
}


const dispatcher = new Port('FrameContainer')
  .connect()


const FrameContainer = (props) => {
  const [pose, changePose] = useState('closed')

  useMount(() => {
    dispatcher
      .addAction('open', () => changePose('open'))
      .addAction('close', () => changePose('closed'))
  })

  return <motion.iframe
    src={props.src}
    initial='hidden'
    animate={pose}
    variants={iframeVariants}
    style={iFrameStyles}/>
}

export default FrameContainer
