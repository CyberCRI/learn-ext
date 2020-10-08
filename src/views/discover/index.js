import _ from 'lodash'

import { renderReactComponent } from '~mixins/react-helpers'

import { OverlayTools } from './overlays'
import { ConceptMap } from './layer-d3'
import { SearchView } from './search-ui'

import './styles.scss'


export const renderView = async () => {
  const cmap = new ConceptMap({
    filters: {},
    mountPoint: '#d3-root',
    onSearchMap: console.log
  })
  window.cmap = cmap

  _.defer(() => {
    cmap.init()
  })

  renderReactComponent('overlay-tools', OverlayTools)
  renderReactComponent('search-ui', SearchView)
}
