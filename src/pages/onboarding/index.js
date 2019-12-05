import React from 'react'
import ScrollTrigger from '@terwanerik/scrolltrigger'

import { renderReactComponent } from '~mixins/react-helpers'

import { LoginSignupButton, LoginSignupDialog, DemoCards } from './presentation'

import './style.scss'
import 'animate.css/animate.css'


const OnboardView = () => (
  <>
    <LoginSignupDialog/>
    <LoginSignupButton/>
  </>
)

const initTriggers = async () => {
  const trigger = new ScrollTrigger({
    trigger: {
      toggle: {
        'class': {
          in: ['st-visible', 'animated'],
          out: ['st-invisible'],
        },
      },
    },
  })
  trigger.add('[data-trigger]')
}

const initComponents = async () => {
  renderReactComponent('login-button', OnboardView)
  renderReactComponent('demo-cards', DemoCards)
}

document.addEventListener('apploaded', () => {
  initTriggers()
  initComponents()
})
