import ScrollTrigger from '@terwanerik/scrolltrigger'

import { renderReactComponent } from '~mixins/react-helpers'

import { DemoCards } from './presentation'
import { DownloadLinks } from './download-buttons'

import './style.scss'


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
  renderReactComponent('demo-cards', DemoCards)
}

document.addEventListener('apploaded', () => {
  initComponents()
  initTriggers()
})
