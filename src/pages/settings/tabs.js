import React from 'react'
import { Divider, Tabs, Tab, Icon } from '@blueprintjs/core'

import Panels from './panels'
import { i18n } from '@ilearn/modules/i18n'

const i18nT = i18n.context('pages.settings.tabs')

const TabTitle = ({ title, icon }) => (
  <span className='np-tab-title with-icon'>
    <Icon icon={icon} className='icon'/>
    {title}
  </span>
)

const SettingsTabs = (props) => {
  return (
    <Tabs large
          renderActiveTabPanelOnly
          vertical
          id='pages-settings'
          className='np-tabs-settings'>
      <Tab id='account'
           title={<TabTitle title={i18nT('account')} icon='user'/>}
           panel={<Panels.Account/>}/>
      <Tab id='general'
           title={<TabTitle title={i18nT('general')} icon='wrench'/>}
           panel={<Panels.General/>}/>
      <Divider/>
      <Tab id='support'
           title={<TabTitle title={i18nT('support')} icon='lifesaver'/>}
           panel={<Panels.Support/>}/>
    </Tabs>
  )
}

//- [!note] to show the privacy tab, you can use this snippet:
//      <Tab id='privacy'
//           title={<TabTitle title={i18nT('privacy')} icon='shield'/>}
//           panel={<Panels.Privacy/>}/>

export default SettingsTabs
