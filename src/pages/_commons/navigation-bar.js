import React from 'react'
import { createStore, createApi } from 'effector'
import { createComponent } from 'effector-react'
import { Navbar, Alignment, AnchorButton } from '@blueprintjs/core'
import { Dialog, Button, Callout } from '@blueprintjs/core'

import { i18n } from '@ilearn/modules/i18n'
import { DemoUserNotice } from './notifications'

import './navbar.scss'

const dialogVisibility = createStore(false)
const dialogControl = createApi(dialogVisibility, {
  show: () => true,
  hide: () => false,
  toggle: (state) => !state,
})

const i18nT = i18n.context('navigationBar')


const LoginSignupDialog = createComponent(dialogVisibility, (props, state) => (
  <Dialog
    isOpen={state}
    onClose={dialogControl.hide}
    title={i18nT('loginDialog.title')}
    className='login-dialog'>
    <Callout>
      <div>
        <img src='/media/logos/learning-planet.png' height='36px'/>
        <p>{i18nT('loginDialog.description')}</p>
      </div>

      <AnchorButton
        text={i18nT('loginDialog.buttonLabel')}
        href={window.jstate.urls.login}
        icon='arrow-right'/>

      <small>
        <p>If you have previously used WeLearn please ensure you use the same email
        address when you login or register.</p>
        <p>Having trouble? In case your account does not link automatically or if your email
        was wrong, just drop us a mail -- we will find and connect your account.</p>
      </small>
    </Callout>
  </Dialog>
))


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

const BigNavBar = () => {
  return (
    <Navbar className='np-navbar bp3-dark'>
      <Navbar.Group align={Alignment.LEFT}>
        <AnchorButton
          text={i18nT('heading')}
          minimal
          href='/pages/onboarding.html'/>
        <Navbar.Divider/>

        <AnchorButton
          text={i18nT('links.dashboard.label')}
          minimal
          href='/pages/dashboard.html'
          icon='book'/>

        <AnchorButton
          text={i18nT('links.discover.label')}
          minimal
          href='/pages/discover.html'
          icon='mountain'/>
      </Navbar.Group>
      <Navbar.Group align={Alignment.RIGHT}>
        <DemoUserNotice/>
        <AnchorButton
          text={i18nT('links.settings.label')}
          minimal
          href='/pages/settings.html'
          icon='settings'/>
      </Navbar.Group>
    </Navbar>
  )
}

const SlimNavBar = () => {
  return (
    <Navbar className='np-navbar bp3-dark'>
      <Navbar.Group align={Alignment.LEFT}>
        <AnchorButton
          text={i18nT('heading')}
          minimal
          href='/pages/onboarding.html'/>
      </Navbar.Group>
      <Navbar.Group align={Alignment.RIGHT}>
        <LoginSignupButton/>
      </Navbar.Group>
    </Navbar>
  )
}

const NavigationBar = () => {
  if (window.jstate.authorized) {
    return <BigNavBar/>
  }
  return <SlimNavBar/>
}


export default NavigationBar
