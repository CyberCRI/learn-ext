import React from 'react'
import { Divider, Tabs, Tab } from '@blueprintjs/core'
import * as FiIcon from 'react-icons/fi'

import Panels from './panels'
import { i18n } from '@ilearn/modules/i18n'

const i18nT = i18n.context('pages.settings.tabs')

const TabTitle = ({ title, icon }) => (
  <span className='np-tab-title with-icon'>
    {icon}
    {title}
  </span>
)

const SettingsTabs = (props) => {
  return (
    <Tabs large
          vertical
          id='pages-settings'
          className='np-tabs-settings'
          renderActiveTabPanelOnly>
      <Tab id='general'
           title={<TabTitle title={i18nT('general')} icon={<FiIcon.FiUser/>}/>}
           panel={<Panels.General/>}/>
      <Tab id='account'
           title={<TabTitle title={i18nT('account')} icon={<FiIcon.FiUser/>}/>}
           panel={<Panels.Account/>}/>
      <Tab id='privacy'
           title={<TabTitle title={i18nT('privacy')} icon={<FiIcon.FiShield/>}/>}
           panel={<Panels.Privacy/>}/>
      <Divider/>
      <Tab id='support'
           title={<TabTitle title={i18nT('support')} icon={<FiIcon.FiLifeBuoy/>}/>}
           panel={<Panels.Support/>}/>
    </Tabs>
  )
}

export default SettingsTabs
