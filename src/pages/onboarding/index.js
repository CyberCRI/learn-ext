import ScrollTrigger from '@terwanerik/scrolltrigger'

import { setup } from '../_commons'
import { renderReactComponent } from '~mixins/react-helpers'

import { DemoCards } from './presentation'
import { DownloadLinks } from './download-buttons'

import './style.scss'


window.addEventListener('load', async () => {
  await setup()
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

  renderReactComponent('download-buttons', DownloadLinks)
  renderReactComponent('demo-cards', DemoCards)
})
