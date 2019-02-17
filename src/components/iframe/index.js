import React, { useState, useEffect, useRef } from 'react'
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
  const prevPose = useRef(pose)

  const onPoseChange = (msg) => {
    if (msg.action == 'togglePopout') {
      const nextPose = prevPose === 'open' ? 'closed' : 'open'
      prevPose.current = nextPose
      changePose(nextPose)
    }
    if (msg.action == 'closePopout') {
      changePose('closed')
    }
    console.log(msg)
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
