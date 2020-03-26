import queryStrings from 'query-string'
import { renderReactComponent } from '~mixins/react-helpers'

import { setupMapView } from './renderer'
import { OverlayCards, OverlayConcepts, OverlayTools } from './overlays'
import { $globalContext } from '~page-commons/store'

import { MapLayerSources } from './consts'
import { didPickLayer } from './store'

import './styles.scss'

const initMap = async () => {
  const atlas = await setupMapView({ element: document.getElementById('atlas') })

  const defaultLayer = MapLayerSources.find((s) => s.default)
  const { query } = queryStrings.parseUrl(window.location.href, { arrayFormat: 'comma' })

  if (query.src) {
    // pick this layer.
    didPickLayer({
      id: query.lid,
      label: 'Shared',
      src: query.src,
    })
  } else {
    didPickLayer(defaultLayer)
  }
}

export const renderView = async () => {
  renderReactComponent('overlay-tools', OverlayTools)
  renderReactComponent('overlay-concepts', OverlayConcepts)
  renderReactComponent('discover-view', OverlayCards)
  initMap()
}
