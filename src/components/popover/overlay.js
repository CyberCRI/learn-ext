import React, { useEffect } from 'react'
import { Overlay } from '@blueprintjs/core'
import { useEffectOnce, useLogger, useToggle } from 'react-use'
import { InteractiveCard } from '~components/cards'
import { Port } from '~procs/portal'


const dispatcher = new Port('PopOverlay')
  .connect()


export const PopOverlay = (props) => {
  const [ isOpen, toggle ] = useToggle(false)

  useEffect(() => {
    dispatcher
      .addAction('open', () => toggle(true))
      .addAction('close', () => toggle(false))
      .addAction('notify', (m) => console.log('msg: ', m))
  })
  useLogger('PopOverlay')

  const dispatchClose = () => {
    dispatcher.dispatch({
      context: 'broadcast',
      payload: { action: 'close' },
    })
  }

  return (
    <Overlay isOpen={isOpen} onClose={dispatchClose}>
      <div className='card-container'>
        <InteractiveCard isOpen={isOpen} className='np-basic-card'>
          <div>Boop</div>
        </InteractiveCard>
      </div>
    </Overlay>
  )
}
