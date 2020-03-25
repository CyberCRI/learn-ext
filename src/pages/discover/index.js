import { setup } from '../_commons'

import { renderReactComponent } from '~mixins/react-helpers'

import { setupMapView } from '~views/discover'
import { OverlayCards, OverlayConcepts, OverlayTools } from '~views/discover/overlays'

import './style.scss'


window.addEventListener('load', async () => {
  await setup()

  setupMapView({ element: document.getElementById('atlas') })


  renderReactComponent('overlay-tools', OverlayTools)
  renderReactComponent('overlay-concepts', OverlayConcepts)
  renderReactComponent('discover-view', OverlayCards)
})
