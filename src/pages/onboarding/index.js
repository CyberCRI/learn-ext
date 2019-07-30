import React, { Component } from 'react'
import { Card, Callout, Divider, Intent, Tabs, Tab, Elevation } from '@blueprintjs/core'
import { renderReactComponent } from '~mixins/react-helpers'
import { AccountSelector } from '~components/input/settings'

import './_onboarding.sass'


const WelcomeCard = () => (
  <Card elevation={Elevation.THREE}>
    <h2>Thanks for using iLearn!</h2>

    <AccountSelector/>
  </Card>
)

document.addEventListener('apploaded', () => {
  renderReactComponent('onboarding', WelcomeCard)
})
