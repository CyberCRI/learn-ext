// Notification is a global component to show only the important notices.
// Currently, this means two things: Changelog Page, if it wasnt seen
// by the user, and a sticky notification if user is browsing as a guest.
import React from 'react'
import { useEffectOnce } from 'react-use'
import { Toaster, Tooltip, Button } from '@blueprintjs/core'

import { LocalStorage } from '@ilearn/modules/mixins'

import './notification-styles.scss'


export const GlobalToaster = Toaster.create({
  className: 'notifications global',
  position: 'top-right',
})

export const DemoUserNotice = () => {
  const [ isVisible, setVisibility ] = React.useState(false)
  useEffectOnce(() => {
    const { user } = window.jstate
    if (user && user.demo) {
      setVisibility(true)
    }
  })
  if (!isVisible) {
    return null
  }
  return (
    <Tooltip content='You are browsing WeLearn as a guest user.'>
      <Button icon='crown' minimal intent='primary'/>
    </Tooltip>
  )
}

export const initNotifications = async () => {
  const { user } = window.jstate
  const notifyDemoUser = await LocalStorage.get('pref.show_demo_notice', true)

  if (notifyDemoUser && user && user.demo) {
    GlobalToaster.show({
      message: 'You are browsing WeLearn as guest.',
      icon: 'crown',
      className: 'notice guest',
      timeout: 10000,
      onDismiss: (didTimeoutExpire) => {
        if (!didTimeoutExpire) {
          // Since user dismissed it themselves, we'll not show it again.
          LocalStorage.set('pref.show_demo_notice', false)
        }
      },
    })
  }
}
