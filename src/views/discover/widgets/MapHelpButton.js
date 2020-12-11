import React from 'react'
import { createStore, createApi } from 'effector'
import { useStore } from 'effector-react'
import { Dialog, Button, Callout } from '@blueprintjs/core'


const $dialogVisibility = createStore(false)
const dialogControl = createApi($dialogVisibility, {
  show: () => true,
  hide: () => false,
  toggle: (state) => !state,
})


const MapHelpDialog = (props) => {
  const visibility = useStore($dialogVisibility)

  return (
    <Dialog
      isOpen={visibility}
      onClose={dialogControl.hide}
      title={"WeLearn Map Explanation"}
      icon='help'
      className='map-help-dialog'>
      <div className='video'>
        <iframe
          src="https://www.loom.com/embed/6922c02142db4837944e7355618a7180"
          frameborder="0"
          webkitallowfullscreen="webkitallowfullscreen"
          mozallowfullscreen="mozallowfullscreen"
          allowfullscreen="allowfullscreen"
          allow="fullscreen"
          style={{ height: 380, width: '100%' }}/>
      </div>
    </Dialog>
  )
}


export const MapHelpButton = (props) => {
  return <>
    <MapHelpDialog/>
    <Button
      onClick={dialogControl.toggle}
      icon='help'
      intent='primary'
      text={'Help'}/>
  </>
}
