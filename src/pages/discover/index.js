import { setupInstance, renderView } from '~views/discover'

import { ensureLogin } from '~components/input/loginSensor'

import './style.scss'

const init = () => {
  setupInstance({
    element: document.getElementById('atlas'),
    pixelRatio: window.devicePixelRatio || 1,
  })

  renderView()
}

document.addEventListener('apploaded', () => {
  ensureLogin({ autoRedirect: true })
    .then(init)
})
