import React, { Component } from 'react'
import { Card, Callout, Divider, Intent, Tabs, Tab, Elevation } from '@blueprintjs/core'

import { renderReactComponent } from '~mixins/utils'

import './_settings.sass'

const SettingsContainer = (props) => {
  return (
    <Card elevation={Elevation.THREE}>
      <h2>Settings</h2>

    </Card>
  )
}


window.addEventListener('load', () => {
  console.info('Init Settings')
  renderReactComponent('settings', SettingsContainer)
})
