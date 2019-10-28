import { renderReactComponent } from '~mixins/react-helpers'
import { DiscoverView, setupInstance } from '~views/discover'

import './style.scss'


document.addEventListener('apploaded', () => {
  window.atlas = setupInstance({
    element: document.getElementById('atlas'),
    pixelRatio: window.devicePixelRatio || 1,
    onClick: (e) => {
      console.log(e)
    },
  })

  renderReactComponent('discover', DiscoverView)
})
