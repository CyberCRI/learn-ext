import React from 'react'
import { createStore, createApi } from 'effector'
import { useStore } from 'effector-react'
import { Navbar, Alignment, AnchorButton } from '@blueprintjs/core'
import { Dialog, Button, Callout } from '@blueprintjs/core'

import { i18n } from '@ilearn/modules/i18n'
import { $globalContext } from './store'

import AddToWelearnButton from '~components/ingress-button'


const $dialogVisibility = createStore(false)
const dialogControl = createApi($dialogVisibility, {
  show: () => true,
  hide: () => false,
  toggle: (state) => !state,
})

const i18nT = i18n.context('navigationBar')


const LoginSignupDialog = (props) => {
  const visibility = useStore($dialogVisibility)
  const node = useStore($globalContext)

  return (
    <Dialog
      isOpen={visibility}
      onClose={dialogControl.hide}
      title={i18nT('loginDialog.title')}
      icon='log-in'
      className='login-dialog'>
      <Callout className='login-opts' icon='info-sign'>
        <div className='lp-blurb'>
          <p>WeLearn uses Learning Planet for secure authentication.</p>
          <p>
            <strong>
              If you already have an account at CRI, you can use your
              existing credentials to login or alternatively create a new account.
            </strong>
          </p>
        </div>
      </Callout>
      <div className='actions'>

        <AnchorButton
          text={i18nT('loginDialog.buttonLabel')}
          href={node.urls.login}
          intent='primary'
          className='login-button'
          rightIcon='arrow-right'
          large/>

        <div className='smalltext'>
          <p>If you have previously used WeLearn please ensure you use the same email
          address when you login or register.</p>
          <p>Having trouble? In case your account does not link automatically or if your email
          was wrong, just drop us a mail -- we will find and connect your account.</p>
        </div>
        <div className='lp-logo'>
          <img
            src='/media/logos/learning-planet.png'
            height='36px'
            title='Learning Planet Logo'/>
        </div>
      </div>
    </Dialog>
  )
}


const LoginSignupButton = (props) => {
  return <>
    <LoginSignupDialog/>
    <Button
      onClick={dialogControl.toggle}
      icon='log-in'
      intent='primary'
      text={i18nT('links.login.label')}/>
  </>
}


export const NavigationBar = () => {
  const node = useStore($globalContext)

  return (
    <Navbar className='np-navbar'>
      <Navbar.Group align={Alignment.LEFT}>
        <AnchorButton
          text={i18nT('heading')}
          minimal
          href='/pages/onboarding.html'/>
        <Navbar.Divider/>
        {node.authorized &&
          <AnchorButton
            text={i18nT('links.dashboard.label')}
            minimal
            href='/pages/dashboard.html'
            icon='book'/>}
        <AnchorButton
          text={i18nT('links.discover.label')}
          minimal
          href='/pages/discover.html'
          icon='mountain'/>
        <AddToWelearnButton/>
      </Navbar.Group>
      <Navbar.Group align={Alignment.RIGHT}>
        {node.authorized
          ? <AnchorButton
            text={i18nT('links.settings.label')}
            minimal
            href='/pages/settings.html'
            icon='settings'/>
          : <LoginSignupButton/>}
      </Navbar.Group>
    </Navbar>
  )
}


export default NavigationBar
