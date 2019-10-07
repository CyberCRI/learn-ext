import React from 'react'
import { Navbar, Alignment, AnchorButton } from '@blueprintjs/core'
import * as FiIcon from 'react-icons/fi'

import { i18n } from '@ilearn/modules/i18n'

const i18nT = i18n.context('navigationBar')

const NavigationBar = () => (
  // Render Navigation Bar
  <Navbar className='np-navbar bp3-dark'>
    <Navbar.Group align={Alignment.LEFT}>
      <Navbar.Heading>{i18nT('heading')}</Navbar.Heading>
      <Navbar.Divider/>

      <AnchorButton
        text={i18nT('links.dashboard.label')}
        minimal
        href='/pages/dashboard.html'
        icon='book'/>

      <AnchorButton
        text={i18nT('links.discover.label')}
        minimal
        href='/pages/options.html'
        icon={<FiIcon.FiCompass/>}/>
    </Navbar.Group>
    <Navbar.Group align={Alignment.RIGHT}>
      <AnchorButton
        text={i18nT('links.settings.label')}
        minimal
        href='/pages/settings.html'
        icon={<FiIcon.FiSettings/>}/>
    </Navbar.Group>
  </Navbar>
)

export default NavigationBar
