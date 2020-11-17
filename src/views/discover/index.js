import _ from 'lodash'
import { SearchDriver } from '@elastic/search-ui'

import { renderReactComponent } from '~mixins/react-helpers'

import { OverlayTools } from './overlays'
import { ConceptMap } from './layer-d3'
import { SearchView } from './search-ui'
import { didPickLayer } from './store'
// import { ConceptMap } from 'welearn-map'

import { searchConfig } from './search-ui'
import { $globalContext } from '~page-commons/store'

import './styles.scss'


function getInitialState(driver) {
  // Since we initialise the SearchDriver manually, we get the freedom to
  // hook into its initial state to keep the UI in sync with the URL.
  const state = driver.getState()
  const filters = _(state.filters).keyBy('field')

  return {
    source: filters.get('source.values.0'),
    user: filters.get('user.values.0'),
  }
}


export const renderView = async () => {
  const cmap = new ConceptMap({
    filters: {},
    mountPoint: '#d3-root',
    onSearchMap: console.log,
  })
  const searchDriver = new SearchDriver(searchConfig)
  const initialSearchState = getInitialState(searchDriver)

  if (initialSearchState.user) {
    // Currently we use "user" to set the filters in ConceptMap before the map
    // is initialized.
    cmap.filters.user = initialSearchState.user
    didPickLayer({ id: initialSearchState.user, src: initialSearchState.user })
  } else {
    didPickLayer({ id: 'everything', src: '' })
  }

  window.cmap = cmap
  window.searchDriver = searchDriver

  // [!todo] Make the overlay tools be in sync as well.
  renderReactComponent('overlay-tools', OverlayTools)
  renderReactComponent('search-ui', SearchView, { driver: searchDriver })

  _.defer(() => {
    // didPickLayer({ id: 'everything', src: '' })
    cmap.init()
  })
}
