import React, { Component } from 'react'
import { Card, Callout, Divider, Intent, Tabs, Tab, Elevation } from '@blueprintjs/core'
import { renderReactComponent } from '~mixins/utils'

import './_onboarding.sass'


const WelcomeCard = () => (
  <Card elevation={Elevation.THREE}>
    <h2>Thanks for using iLearn!</h2>
  </Card>
)


window.addEventListener('load', () => {
  console.info('Init Settings')
  renderReactComponent('onboarding', WelcomeCard)
})
