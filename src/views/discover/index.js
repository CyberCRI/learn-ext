import _ from 'lodash'
import { SearchDriver } from '@elastic/search-ui'

import { renderReactComponent } from '~mixins/react-helpers'
import { i18n } from '@ilearn/modules/i18n'

import { OverlayTools } from './overlays'
import { ConceptMap } from './layer-d3'
import { SearchView } from './search-ui'
import { MapCollapseButton } from './map-collapse'

import { MapLayerSources } from './consts'

import { didPickLayer, onPickHashTag, viewportEvent, setAvailableLayers, $searchState, $layerSource } from './store'

import { searchConfig } from './search-ui'
import { $globalContext } from '~page-commons/store'

import { ResourceEditDialog } from '~components/resources/edit-resource'
import { ResourceEditorControl, didClickOnHashTag } from '~components/resources/store'
import { didClickOnConcept } from '~components/concepts'

import './styles.scss'


function wireUpEffects(driver) {
  const actions = driver.getActions()

  didPickLayer.watch(layer => {
    // actions.clearFilters(['user'])
    actions.setFilter('user', layer.src)
    if (!layer.showHashtags) {
      actions.removeFilter('hashtag')
    }
  })

  onPickHashTag.watch(tag => {
    // actions.clearFilters(['user'])
    actions.setFilter('hashtag', tag)
    actions.setFilter('source', 'hashtag')
    // actions.setSearchTerm('', { shouldClearFilters: false })
  })

  didClickOnConcept.watch(concept => {
    actions.removeFilter('portal')
    actions.setFilter('source', 'concept')
    actions.setFilter('concept', concept.title)
    actions.setFilter('wikidata_id', concept.wikidata_id)
    // actions.setSearchTerm(concept.title, { shouldClearFilters: false })
  })

  viewportEvent.click.watch(event => {
    actions.removeFilter('concept')
    actions.removeFilter('portal')

    const { source, data } = event
    if (source === 'concept') {
      actions.setFilter('concept', data.title)
    }
    if (source === 'portal') {
      actions.setFilter('portal', data.title)
    }
    actions.setFilter('source', source)
    actions.setFilter('wikidata_id', data.wikidata_id)
    // actions.setSearchTerm(data.title, { shouldClearFilters: false })
  })

  ResourceEditorControl.hide.watch(event => {
    const currentpage = driver.getState().current
    actions.setCurrent(currentpage)
  })
}


function getSearchStateProps(state) {
  // Since we initialise the SearchDriver manually, we get the freedom to
  // hook into its initial state to keep the UI in sync with the URL.
  const filters = _(state.filters).keyBy('field')

  return {
    resultSearchTerm: state.resultSearchTerm,
    searchTerm: state.searchTerm,
    source: filters.get('source.values.0'),
    user: filters.get('user.values.0'),
    portal: filters.get('portal.values.0'),
    concept: filters.get('concept.values.0'),
    wikidata_id: filters.get('wikidata_id.values.0'),
    hashtag: filters.get('hashtag.values.0'),
  }
}

function initialiseLayers() {
  const i18nT = i18n.context('pages.discover.sections.atlas.layers')
  const layers = [...MapLayerSources]
  const ucontext = window.jstate

  if (ucontext.authorized) {
    layers.push({
      id: ucontext.user.email,
      label: i18nT`user`,
      src: ucontext.user.email,
      icon: 'layout-circle',
      user: true,
      showHashtags: true,
    })

    if (ucontext.user.groups.length > 0) {
      // [!todo] support more than 1 group.
      const group = ucontext.user.groups[0]

      layers.push({
        id: `${group.guid}@group`,
        label: i18nT`group`,
        src: `${group.guid}@group`,
        icon: 'layout-group-by',
        user: true,
        showHashtags: true,
      })
    }
  }
  setAvailableLayers(layers)
  return layers
}


export const renderView = async () => {
  const cmap = new ConceptMap({
    filters: {},
    mountPoint: '#d3-root',
    onSearchMap: console.log,
  })
  const searchDriver = new SearchDriver(searchConfig)
  const initialSearchState = getSearchStateProps(searchDriver.getState())

  const layers = initialiseLayers()

  if (initialSearchState.user) {
    // Currently we use "user" to set the filters in ConceptMap before the map
    // is initialized.
    const layer = _.find(layers, ['src', initialSearchState.user])
    cmap.filters.user = initialSearchState.user
    didPickLayer(layer)
  } else {
    const layer = _.find(layers, ['default', true])
    didPickLayer(layer)
  }

  if (initialSearchState.hashtag) {
    cmap.filters.hashtag = initialSearchState.hashtag
  }

  wireUpEffects(searchDriver)

  searchDriver.subscribeToStateChanges((state) => {
    const derivedState = getSearchStateProps(state)
    $searchState.set(derivedState)

    const currentLayer = $layerSource.getState()

    if (currentLayer.src !== derivedState.user) {
      // This subscription is called often, hence we add a manual check on the
      // state change before firing the didPickLayer event.
      //
      // This is pretty important to avoid infinite loop of state-change--update.
      let layer = _.find(layers, ['src', derivedState.user])
      if (layer === undefined) {
        layer = _.find(layers, ['default', true])
      }
      didPickLayer(layer)
    }
  })

  window.cmap = cmap
  window.searchDriver = searchDriver

  // [!todo] Make the overlay tools be in sync as well.
  renderReactComponent('overlay-tools', OverlayTools)
  renderReactComponent('search-ui', SearchView, { driver: searchDriver })
  renderReactComponent('edit-ui', ResourceEditDialog)
  renderReactComponent('map-collapse', MapCollapseButton)

  _.defer(() => {
    // didPickLayer({ id: 'everything', src: '' })
    cmap.init()
  })
}
