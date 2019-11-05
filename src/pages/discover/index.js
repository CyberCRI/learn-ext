import { renderReactComponent } from '~mixins/react-helpers'
import { DiscoverView, setupInstance } from '~views/discover'

import { ensureLogin } from '~components/input/loginSensor'

import './style.scss'

const init = () => {
  window.atlas = setupInstance({
    element: document.getElementById('atlas'),
    pixelRatio: window.devicePixelRatio || 1,
  })

  renderReactComponent('discover', DiscoverView)
}

document.addEventListener('apploaded', () => {
  ensureLogin({ autoRedirect: true })
    .then(init)
})
