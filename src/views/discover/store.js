import { createEvent, createStore } from 'effector'

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
}

export const didGetResources = createEvent()
export const didPickLayer = createEvent()

export const setProgress = createEvent()
export const $progress = createStore({ loading: false, value: 0 })
  .on(setProgress, (state, value) => ({ loading: value !== 1, value }))
  .reset(didPickLayer)

export const $layerSource = createStore({})
  .on(didPickLayer, (_, layerId) => layerId)

export const selectedConcepts = createStore([])
export const userResources = createStore([])
  .on(didGetResources, (state, vals) => vals)

export const setCursor = createEvent()

export const $cursor = createStore({ current: 0, count: 0})
  .on(setCursor, (state, page) => ({ ...state, ...page }))
  .reset(didGetResources)
  .reset(didPickLayer)
