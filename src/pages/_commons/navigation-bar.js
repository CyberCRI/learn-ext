import React from 'react'
import { Navbar, Alignment, AnchorButton } from '@blueprintjs/core'
import * as FiIcon from 'react-icons/fi'

import { i18n } from '~procs/wrappers'


const NavigationBar = () => (
  // Render Navigation Bar
  <Navbar className='np-navbar bp3-dark'>
    <Navbar.Group align={Alignment.LEFT}>
      <Navbar.Heading>{i18n('navigationBar.heading')}</Navbar.Heading>
      <Navbar.Divider/>

      <AnchorButton
        text={i18n('navigationBar.links.dashboard.label')}
        minimal
        href='/pages/dashboard.html'
        icon='book'/>

      <AnchorButton
        text={i18n('navigationBar.links.discover.label')}
        minimal
        href='/pages/options.html'
        icon={<FiIcon.FiCompass/>}/>
    </Navbar.Group>
    <Navbar.Group align={Alignment.RIGHT}>
      <AnchorButton
        text={i18n('navigationBar.links.settings.label')}
        minimal
        href='/pages/settings.html'
        icon={<FiIcon.FiSettings/>}/>
    </Navbar.Group>
  </Navbar>
)

export default NavigationBar
