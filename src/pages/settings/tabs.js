import React from 'react'
import { Divider, Tabs, Tab } from '@blueprintjs/core'
import * as FiIcon from 'react-icons/fi'

import Panels from './panels'
import { i18n } from '~procs/wrappers'

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
        title={<TabTitle title={i18n('pages.settings.tabs.account')} icon={<FiIcon.FiUser/>}/>}
        panel={<Panels.Account/>}/>
      <Tab
        id='privacy'
        title={<TabTitle title={i18n('pages.settings.tabs.privacy')} icon={<FiIcon.FiShield/>}/>}
        panel={<Panels.Privacy/>}/>
      <Divider/>
      <Tab
        id='support'
        title={<TabTitle title={i18n('pages.settings.tabs.support')} icon={<FiIcon.FiLifeBuoy/>}/>}
        panel={<Panels.Support/>}/>
    </Tabs>
  )
}

export default SettingsTabs
