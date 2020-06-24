import { createEvent, createEffect, createStore } from 'effector'
import { Set } from 'immutable'
import queryStrings from 'query-string'

/**
 *
 * Bojour! We have some freshly baked _layers_, fried _filters_, and cool _items_.
 * Please choose a _render flavour_, and appropriate _transfer function_.
 * Oh, and don't forget our all-you-can-consume _data sauces_!
 *
 * Would you pay with performance or memory? We also support network payments.
 */

const BATCH_LIMIT = 1000

const fetchItems = async (query) => {
  const url = queryStrings.stringifyUrl({ url: 'https://staging.welearn.cri-paris.org:8403/carte/feed', query })

  const r = await fetch(url, {
    method: 'get',
    mode: 'cors',
    headers: { 'Content-Type': 'application/json' },
  })
  return await r.json()
}

export const nodePicker = {
  merge: createEvent(),
  reset: createEvent(),
  replace: createEvent(),
  remove: createEvent(),
  click: createEvent(),
}

export const didPickLayer = createEvent()

export const setProgress = createEvent()
export const $progress = createStore({ loading: false, value: 0 })
  .on(setProgress, (state, value) => ({ loading: value !== 1, value }))
  .reset(didPickLayer)

export const $layerSource = createStore({})
  .on(didPickLayer, (_, layerId) => layerId)

export const fetchResources = createEffect()
  .use(async ({ x, y }) => {
    setProgress(0)
    const items = await fetchItems({ x, y, r: .4})
    setProgress(1)
    console.log('items=', items)
    return items.results
  })

export const selectedConcepts = createStore(Set())
  .on(nodePicker.merge, (state, vals) => state.union(Set(vals)))
  .on(nodePicker.replace, (_, vals) => Set(vals))
  .on(nodePicker.reset, () => Set())
  .on(nodePicker.remove, (state, vals) => state.subtract(Set(vals)))

export const userResources = createStore([])
  .on(nodePicker.click, (state, query) => {
    fetchResources(query)
    return state
  })
  .on(fetchResources.done, (state, params) => params.result)

// $layerSource
//   .watch((layer) => fetchResources({ layer }))

export const setCursor = createEvent()

export const $cursor = createStore({ current: 0, count: 0})
  .on(setCursor, (state, page) => ({ ...state, ...page }))
  .reset(nodePicker.reset)
  .reset(nodePicker.replace)
  .reset(didPickLayer)


// We're going to use this properly.
// Let's start with: define dotatlas events and stores.

export const viewportEvent = {
  zoom: createEvent(),
  export: createEvent(),
  nudge: createEvent(),
}

window._vpev = viewportEvent
