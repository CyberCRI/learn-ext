import React, { useState, useEffect } from 'react'
import posed from 'react-pose'

import './iframe.sass'


const PosedFrame = posed.iframe({
  open: {
    opacity: 1,

    staggerChildren: 100,
    delayChildren: 100,

    applyAtStart: {
      display: 'block',
    },
  },
  closed: {
    opacity: 0,

    applyAtEnd: { display: 'none' },
  },
})


const FrameContainer = (props) => {
  const [pose, changePose] = useState('closed')

  const onPoseChange = (msg) => {
    if (msg.action == 'openPopout') {
      changePose('open')
    }
    if (msg.action == 'closePopout') {
      changePose('closed')
    }
  }

  useEffect(() => {
    browser.runtime.onMessage.addListener(onPoseChange)
    return () => {
      browser.runtime.onMessage.removeListener(onPoseChange)
    }
  })

  return <PosedFrame src={props.src} pose={pose} />
}

export default FrameContainer
