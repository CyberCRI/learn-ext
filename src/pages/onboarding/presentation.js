import React from 'react'
import { Dialog, Button } from '@blueprintjs/core'
import { createStore, createApi } from 'effector'
import { useStore } from 'effector-react'
import { sampleSize } from 'lodash'

import { AccountSelector } from '~components/input/settings'
import { ResourceCard } from '~components/cards'

import sampleResources from './resource-sample.json'


const dialogVisibility = createStore(false)
const dialogControl = createApi(dialogVisibility, {
  show: () => true,
  hide: () => false,
  toggle: (state) => !state,
})

export const LoginSignupDialog = (props) => {
  const isOpen = useStore(dialogVisibility)

  return (
    <Dialog isOpen={isOpen} onClose={dialogControl.hide} title='Login to WeLearn'>
      <AccountSelector/>
    </Dialog>
  )
}

export const LoginSignupButton = (props) => {
  return <>
    <Button onClick={dialogControl.toggle} icon='log-in' text='Login'/>
    <Button onClick={dialogControl.toggle} icon='log-in' text='Browse as Guest'/>
  </>
}


export const DemoCards = (props) => {
  const sampledItems = sampleSize(sampleResources, 10)
  return <>
    {sampledItems.map((r) => <ResourceCard key={r.resource_id} {...r}/>)}
  </>
}
