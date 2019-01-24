import React, { Component } from 'react'
import { Card, Callout, Divider, Intent, Tabs, Tab, Elevation } from '@blueprintjs/core'

import { renderReactComponent } from '~mixins/utils'

import './_settings.sass'


const PanelGeneral = () => (
  <div>
  </div>
)

const PanelAccount = () => (
  <div>
  </div>
)

const PanelPrivacy = () => (
  <div>
  </div>
)

const PanelSupport = () => (
  <div>
  </div>
)


const SettingsTabs = (props) => {
  return (
    <Tabs large vertical id='pages-settings'>
      <Tab title='General' id='general' panel={<PanelGeneral/>}/>
      <Tab title='Account' id='account' panel={<PanelAccount/>}/>
      <Tab title='Privacy' id='privacy' panel={<PanelPrivacy/>}/>
      <Divider/>
      <Tab title='Support' id='support' panel={<PanelSupport/>}/>
    </Tabs>
  )
}

const SettingsContainer = (props) => {
  return (
    <Card elevation={Elevation.THREE}>
      <h2>Settings</h2>

      <SettingsTabs />
    </Card>
  )
}


window.addEventListener('load', () => {
  console.info('Init Settings')
  renderReactComponent('settings', SettingsContainer)
})
