import { setup } from '../_commons'
import { setupInstance, renderView } from '~views/discover'

import './style.scss'

// Alrighty! devicePixelRatio is explosive. It needs to be a nice round integer.

const pixelRatioClamped = () => {
  const ratio = window.devicePixelRatio || 1
  if (ratio < 1) {
    // Really, lets not bother.
    return 1
  }
  return Math.ceil(ratio)
}

window.addEventListener('load', async () => {
  await setup()
  setupInstance({
    element: document.getElementById('atlas'),
    pixelRatio: pixelRatioClamped(),
  })

  renderView()
})

