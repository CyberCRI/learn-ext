import queryStrings from 'query-string'
import { renderReactComponent } from '~mixins/react-helpers'

import { OverlayConcepts, OverlayTools } from './overlays'
import { ResultItems, ProgressIndicator } from './search-tools'
import { MapLayerSources } from './consts'
import { didPickLayer } from './store'
import { ConceptMap } from './layer-d3'
import DPadButtons from './dpad-zoom'

import './styles.scss'

const initLayers = async () => {
  const defaultLayer = MapLayerSources.find((s) => s.default)
  const { query } = queryStrings.parseUrl(window.location.href, { arrayFormat: 'comma' })

  if (query.src) {
    // pick this layer.
    await didPickLayer({
      id: query.lid,
      label: 'Shared',
      src: query.src,
    })

    if (query.cset) {
      const csetix = new Set(query.cset)
      console.log(csetix, query)
    }
  } else {
    didPickLayer(defaultLayer)
  }
}

export const renderView = async () => {
  initLayers()
  const cmap = new ConceptMap()

  renderReactComponent('overlay-tools', OverlayTools)
  renderReactComponent('discover-view', ResultItems)
  renderReactComponent('progress-bar', ProgressIndicator)
  renderReactComponent('overlay-dpad', DPadButtons)
}
