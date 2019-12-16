import { setupInstance, renderView } from '~views/discover'

import { ensureLogin } from '~components/input/loginSensor'

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

const init = () => {
  setupInstance({
    element: document.getElementById('atlas'),
    pixelRatio: pixelRatioClamped(),
  })

  renderView()
}

document.addEventListener('apploaded', () => {
  ensureLogin({ autoRedirect: true })
    .then(init)
})
