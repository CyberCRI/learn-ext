import React from 'react'
import { Dialog, Button } from '@blueprintjs/core'
import { createStore, createApi } from 'effector'
import { createComponent } from 'effector-react'
import { sampleSize } from 'lodash'

import { AccountSelector } from '~components/input/settings'
import { ResourceCard } from '~components/cards'
import { initDemoUser } from '~mixins/initializers'

import store from '~mixins/persistence'
import sampleResources from './resource-sample.json'


const dialogVisibility = createStore(false)
const dialogControl = createApi(dialogVisibility, {
  show: () => true,
  hide: () => false,
  toggle: (state) => !state,
})
const guestDialogVisibility = createStore(false)
const guestDialogControl = createApi(guestDialogVisibility, {
  show: () => true,
  hide: () => false,
  toggle: (state) => !state,
})

const shouldNavigateToDiscoverTab = () => {
  setTimeout(() => {
    window.location.assign('/pages/discover.html')
  }, 1000)
}


const GuestAccountInitializer = (props) => {
  const [ status, setStatus ] = React.useState(0)
  const isLoading = status === 1
  const isDone = status === 2
  const didConfirm = () => {
    setStatus(1)
    initDemoUser()
      .then(() => {
        setStatus(2)
        // Show notification next time.
        store.set('pref.show_demo_notice', true)
        shouldNavigateToDiscoverTab()
      })
      .catch(() => {
        // shouldnt happen, but if it does... (. . ')
      })
  }

  return (
    <div className='demo-controller'>
      <span>{isDone && 'Redirecting to Discover tab'}</span>
      <Button
        text='Continue'
        icon='arrow-right'
        intent='primary'
        loading={isLoading}
        disabled={isDone}
        onClick={didConfirm}/>
    </div>
  )
}


const LoginSignupDialog = createComponent(dialogVisibility, (props, state) => (
  <Dialog isOpen={state} onClose={dialogControl.hide} title='Login to WeLearn' className='login-dialog'>
    <AccountSelector onComplete={shouldNavigateToDiscoverTab}/>
  </Dialog>
))

const GuestUserDialog = createComponent(guestDialogVisibility, (props, state) => (
  <Dialog isOpen={state} onClose={guestDialogControl.hide} title='Browse as Guest' className='guest-access'>
    <div className='prompt'>
      <p>We will log you in with a demo account, so you can browse WeLearn without providing your email.</p>
      <p>You can change the user account any time in Settings tab.</p>
      <GuestAccountInitializer/>
    </div>
  </Dialog>
))

export const LoginSignupButton = (props) => {

  return <>
    <LoginSignupDialog/>
    <GuestUserDialog/>
    <Button onClick={dialogControl.toggle} icon='log-in' text='Login'/>
    <Button onClick={guestDialogControl.toggle} icon='crown' text='Browse as Guest'/>
  </>
}


export const DemoCards = (props) => {
  const sampledItems = sampleSize(sampleResources, 10)
  return <>
    {sampledItems.map((r) => <ResourceCard key={r.resource_id} {...r}/>)}
  </>
}
