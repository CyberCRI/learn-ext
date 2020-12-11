import _ from 'lodash'
import { SearchDriver } from '@elastic/search-ui'
import { merge as mergeEvents } from 'effector'

import { renderReactComponent } from '~mixins/react-helpers'

import { OverlayTools } from './overlays'
import { ConceptMap } from './layer-d3'
import { SearchView } from './search-ui'

import { didPickLayer, didPickTag, viewportEvent } from './store'

import { searchConfig } from './search-ui'
import { $globalContext } from '~page-commons/store'

import { ResourceEditDialog } from '~components/resources/edit-resource'
import { ResourceEditorControl, didClickOnHashTag } from '~components/resources/store'
import { didClickOnConcept } from '~components/concepts'

import './styles.scss'


function wireUpEffects(driver) {
  const actions = driver.getActions()

  // Merge the events emitted from HashTags from ResourceCard and Sidebar
  const onPickHashTag = mergeEvents([ didClickOnHashTag, didPickTag ])

  didPickLayer.watch(layer => {
    // actions.clearFilters(['user'])
    actions.setFilter('user', layer.src)
  })

  onPickHashTag.watch(tag => {
    actions.clearFilters(['user'])
    actions.setFilter('hashtag', tag)
    actions.setFilter('source', 'hashtag')
    actions.setSearchTerm('', { shouldClearFilters: false })
  })

  didClickOnConcept.watch(concept => {
    actions.setFilter('source', 'concept')
    actions.setFilter('wikidata_id', concept.wikidata_id)
    actions.setSearchTerm(concept.title, { shouldClearFilters: false })
  })

  viewportEvent.click.watch(event => {
    const { source, data } = event
    actions.setFilter('source', source)
    actions.setFilter('wikidata_id', data.wikidata_id)
    actions.setSearchTerm(data.title, { shouldClearFilters: false })
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
    source: filters.get('source.values.0'),
    user: filters.get('user.values.0'),
    wikidata_id: filters.get('wikidata_id.values.0'),
    hashtag: filters.get('hashtag.values.0'),
  }
}


export const renderView = async () => {
  const cmap = new ConceptMap({
    filters: {},
    mountPoint: '#d3-root',
    onSearchMap: console.log,
  })
  const searchDriver = new SearchDriver(searchConfig)
  const initialSearchState = getSearchStateProps(searchDriver.getState())

  if (initialSearchState.user) {
    // Currently we use "user" to set the filters in ConceptMap before the map
    // is initialized.
    cmap.filters.user = initialSearchState.user
    didPickLayer({ id: initialSearchState.user, src: initialSearchState.user })
  } else {
    didPickLayer({ id: 'everything', src: '' })
  }

  wireUpEffects(searchDriver)

  searchDriver.subscribeToStateChanges((state) => {
    console.log('state change', state, getSearchStateProps(state))
  })

  window.cmap = cmap
  window.searchDriver = searchDriver

  // [!todo] Make the overlay tools be in sync as well.
  renderReactComponent('overlay-tools', OverlayTools)
  renderReactComponent('search-ui', SearchView, { driver: searchDriver })
  renderReactComponent('edit-ui', ResourceEditDialog)

  _.defer(() => {
    // didPickLayer({ id: 'everything', src: '' })
    cmap.init()
  })
}
