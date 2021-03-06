import _ from 'lodash'
import { createEvent, createStore, createApi, merge as mergeEvents } from 'effector'

import { didClickOnHashTag } from '~components/resources/store'
import { didClickOnConcept } from '~components/concepts'

/**
 *
 * Bojour! We have some freshly baked _layers_, fried _filters_, and cool _items_.
 * Please choose a _render flavour_, and appropriate _transfer function_.
 * Oh, and don't forget our all-you-can-consume _data sauces_!
 *
 * Would you pay with performance or memory? We also support network payments.
 */

export const viewportEvent = {
  zoom: createEvent(),
  export: createEvent(),
  nudge: createEvent(),
  click: createEvent(),
  focusNode: createEvent(),
  renderLabel: createEvent(),
}

export const NodeEvents = {
  highlight: createEvent(),
  focus: createEvent(),
  clear: createEvent(),
  undo: createEvent(),
}

export const StateEvents = {
  ready: createEvent(),
}

export const didPickLayer = createEvent()
export const didPickTag = createEvent()
export const onPickHashTag = mergeEvents([ didClickOnHashTag, didPickTag ])

export const setProgress = createEvent()
export const $progress = createStore({ loading: false, value: 0 })
  .on(setProgress, (state, value) => ({ loading: value !== 1, value }))
  .reset(didPickLayer)


export const setAvailableLayers = createEvent()

export const $layersAvailable = createStore([])
  .on(setAvailableLayers, (_, layers) => layers)
export const $layerSource = createStore({})
  .on(didPickLayer, (_, layerId) => layerId)

export const $currentHashtag = createStore('')
  .on(didPickTag, (_, tag) => tag)
  .on(didClickOnHashTag, (_, tag) => tag)
  .reset(didClickOnConcept)
  .reset(viewportEvent.click)

//- These are container stores for D3 visualisation. Specifically this contains
//- all the labels.
export const $markerStore = createStore([])
  .reset(didPickLayer)

export const $markers = createApi($markerStore, {
  appendConcepts: (state, items) => {
    const nodes = items.map(n => ({ kind: 'concept', wikidata_id: n.index, ...n }))
    return _.unionBy(state, nodes, 'wikidata_id')
  },
  appendPortals: (state, items) => {
    const nodes = items.map(n => ({ kind: 'portal', ...n }))
    return _.unionBy(state, nodes, 'wikidata_id')
  },
  clear: (state) => [],
  clearConcepts: (state) => _.filter(state, ['kind', 'portal']),
})

export const $markerSelectionStore = createStore([])
  .on(viewportEvent.click, (state, node) => [node.data])
  .on(viewportEvent.focusNode, (state, node) => [node])
  .on(viewportEvent.renderLabel, (state, node) => [node])
  // .reset(didPickLayer)

export const $markerSelection = createApi($markerSelectionStore, {
  append: (state, items) => {
    return _.unionBy(state, items, 'wikidata_id')
  },
  set: (state, items) => items,
  clear: (state) => [],
})

export const $searchStateInternal = createStore({})
export const $searchState = createApi($searchStateInternal, {
  set: (state, value) => value,
})
