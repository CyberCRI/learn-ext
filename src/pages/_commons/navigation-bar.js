import React from 'react'
import { Navbar, Alignment, AnchorButton } from '@blueprintjs/core'

import { i18n } from '@ilearn/modules/i18n'
import { DemoUserNotice } from './notifications'


const NavigationBar = () => {
  const i18nT = i18n.context('navigationBar')
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

export default NavigationBar
