import _ from 'lodash'

import { renderReactComponent } from '~mixins/react-helpers'

import { OverlayTools } from './overlays'
import { ConceptMap } from './layer-d3'
import { SearchView } from './search-ui'
import { didPickLayer } from './store'
// import { ConceptMap } from 'welearn-map'

import './styles.scss'


export const renderView = async () => {
  const cmap = new ConceptMap({
    filters: {},
    mountPoint: '#d3-root',
    onSearchMap: console.log,
  })
  window.cmap = cmap

  renderReactComponent('overlay-tools', OverlayTools)
  renderReactComponent('search-ui', SearchView)

  _.defer(() => {
    didPickLayer({ id: 'everything', src: '' })
    cmap.init()
  })
}
