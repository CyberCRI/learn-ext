import React, { useState, useEffect } from 'react'
import { useLogger } from 'react-use'
import posed from 'react-pose'
import { Port } from '~procs/portal'

import './iframe.sass'


const PosedIframe = posed.iframe({
  open: {
    opacity: 1,
    applyAtStart: {
      display: 'block',
    },
  },
  closed: {
    opacity: 0,
    applyAtEnd: { display: 'none' },
  },
})


const dispatcher = new Port('FrameContainer')
  .connect()


const FrameContainer = (props) => {
  const [pose, changePose] = useState('closed')
  useLogger('FrameContainer')
  dispatcher.dispatch({
    context: 'tabState',
    payload: {
      active: pose === 'open',
    },
  })

  useEffect(() => {
    dispatcher
      .addAction('open', () => changePose('open'))
      .addAction('close', () => changePose('closed'))
      .addAction('notify', (m) => console.log('msg: ', m))
  })

  return <PosedIframe src={props.src} pose={pose} />
}

export default FrameContainer
