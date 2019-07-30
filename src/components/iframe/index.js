import React, { useState, useEffect } from 'react'
import { useLogger, useMount } from 'react-use'
import posed from 'react-pose'
import { Port } from '~procs/portal'


const PosedIframe = posed.iframe({
  open: {
    opacity: 1,
    applyAtStart: { display: 'block' },
  },
  closed: {
    opacity: 0,
    applyAtEnd: { display: 'none' },
  },
})

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
  zIndex: 12600322,
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

  return <PosedIframe src={props.src} pose={pose} style={iFrameStyles}/>
}

export default FrameContainer
