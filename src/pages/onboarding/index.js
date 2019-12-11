import React from 'react'
import ScrollTrigger from '@terwanerik/scrolltrigger'

import { renderReactComponent } from '~mixins/react-helpers'

import { LoginSignupButton, DemoCards } from './presentation'
import { DownloadLinks } from './download-buttons'

import './style.scss'
import 'animate.css/animate.css'


const OnboardView = () => (
  <>
    <LoginSignupButton/>
  </>
)

const initTriggers = async () => {
  const trigger = new ScrollTrigger({
    trigger: {
      toggle: {
        'class': {
          in: 'visible',
          out: 'invisible',
        },
      },
    },
  })
  trigger.add('[data-trigger]')
}

const initComponents = async () => {
  renderReactComponent('download-buttons', DownloadLinks)
  renderReactComponent('login-button', OnboardView)
  renderReactComponent('demo-cards', DemoCards)
}

document.addEventListener('apploaded', () => {
  initTriggers()
  initComponents()
})
