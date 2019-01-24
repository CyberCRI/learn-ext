import React, { Component } from 'react'
import { Card, Callout, Divider, Intent, Tabs, Tab, Elevation } from '@blueprintjs/core'

import { renderReactComponent } from '~mixins/utils'

import './_settings.sass'


const PanelGeneral = () => (
  <div>
    <Callout icon='asterisk' title='Heads up!'>
      <p>Hey there! This is the general settings panel.</p>
      <p></p>
    </Callout>
  </div>
)

const PanelAccount = () => (
  <div>
    <Callout icon='id-number' title='Account' intent={Intent.PRIMARY}>
      <p>Hey there! This is the account settings panel.</p>
      <p></p>
    </Callout>
  </div>
)

const PanelPrivacy = () => (
  <div>
    <Callout icon='shield' title='Privacy' intent={Intent.PRIMARY}>
      <p>Hey there! This is the privacy settings panel.</p>
      <p></p>
    </Callout>
  </div>
)

const PanelSupport = () => (
  <div>
    <Callout icon='help' title='Help and Support' intent={Intent.PRIMARY}>
      <p>Hey there! This is the support settings panel.</p>
      <p></p>
    </Callout>
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
