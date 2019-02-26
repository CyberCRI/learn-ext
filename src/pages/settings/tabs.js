import React from 'react'
import { Divider, Tabs, Tab } from '@blueprintjs/core'
import * as FiIcon from 'react-icons/fi'

import Panels from './panels'

const TabTitle = ({ title, icon }) => (
  <span className='np-tab-title with-icon'>
    {icon}
    {title}
  </span>
)

const SettingsTabs = (props) => {
  return (
    <Tabs
      large
      vertical
      id='pages-settings'
      className='np-tabs-settings'
      renderActiveTabPanelOnly>
      <Tab
        id='account'
        title={<TabTitle title='Account' icon={<FiIcon.FiUser/>}/>}
        panel={<Panels.Account/>}/>
      <Tab
        id='general'
        title={<TabTitle title='General' icon={<FiIcon.FiSettings/>}/>}
        panel={<Panels.General/>}/>
      <Tab
        id='privacy'
        title={<TabTitle title='Privacy' icon={<FiIcon.FiShield/>}/>}
        panel={<Panels.Privacy/>}/>
      <Divider/>
      <Tab
        id='support'
        title={<TabTitle title='Support' icon={<FiIcon.FiLifeBuoy/>}/>}
        panel={<Panels.Support/>}/>
    </Tabs>
  )
}

export default SettingsTabs
