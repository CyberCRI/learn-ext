import React from 'react'
import { Navbar, Alignment, AnchorButton } from '@blueprintjs/core'
import * as FiIcon from 'react-icons/fi'

const NavigationBar = () => (
  // Render Navigation Bar
  <Navbar className='np-navbar bp3-dark'>
    <Navbar.Group align={Alignment.LEFT}>
      <Navbar.Heading>iLearn</Navbar.Heading>
      <Navbar.Divider/>

      <AnchorButton
        text='Resources'
        minimal
        href='/pages/dashboard.html'
        icon='book'/>

      <AnchorButton
        text='Discover'
        minimal
        href='/pages/options.html'
        icon={<FiIcon.FiCompass/>}/>
    </Navbar.Group>
    <Navbar.Group align={Alignment.RIGHT}>
      <AnchorButton
        text='Settings'
        minimal
        href='/pages/settings.html'
        icon={<FiIcon.FiSettings/>}/>
      <AnchorButton
        text='Help'
        minimal
        href='/pages/settings.html'
        icon={<FiIcon.FiSettings/>}/>
    </Navbar.Group>
  </Navbar>
)

export default NavigationBar
