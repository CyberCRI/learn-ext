import queryStrings from 'query-string'
import { renderReactComponent } from '~mixins/react-helpers'

import { OverlayTools } from './overlays'
import { ResultItems, ProgressIndicator } from './search-tools'
import { MapLayerSources } from './consts'
import { didPickLayer } from './store'
import { ConceptMap } from './layer-d3'
import DPadButtons from './dpad-zoom'
import { SearchView } from './search-ui'

import './styles.scss'

const initLayers = async () => {
  const defaultLayer = MapLayerSources.find((s) => s.default)
  const { query } = queryStrings.parseUrl(window.location.href, { arrayFormat: 'comma' })

  if (query.src) {
    // pick this layer.
    didPickLayer({
      id: query.lid,
      label: 'Shared',
      src: query.src,
      user: true,
    })
  } else {
    didPickLayer(defaultLayer)
  }
}

export const renderView = async () => {
  const cmap = new ConceptMap()

  // [!todo] the both things below are hacks.
  window.cmap = cmap
  window.setTimeout(() => initLayers(), 500)

  renderReactComponent('overlay-tools', OverlayTools)
  renderReactComponent('discover-view', ResultItems)
  renderReactComponent('progress-bar', ProgressIndicator)
  renderReactComponent('overlay-dpad', DPadButtons)
  renderReactComponent('search-ui', SearchView)
}
