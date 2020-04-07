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

const fetchItems = async (layer, query) => {
  const reqUrl = queryStrings.stringifyUrl({ url: layer.src, query })

  const r = await fetch(reqUrl, {
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
}

export const didPickLayer = createEvent()

export const setProgress = createEvent()
export const $progress = createStore({ loading: true, value: 0.1 })
  .on(setProgress, (state, value) => ({ loading: value !== 1, value }))
  .reset(didPickLayer)

export const $layerSource = createStore({})
  .on(didPickLayer, (_, layerId) => layerId)

export const fetchResources = createEffect()
  .use(async ({ layer }) => {
    setProgress(0.4)
    let page = { limit: 1000, skip: 0, next: true }

    let items = []

    while (page.next) {
      console.log('[!fetch layer]', page, layer)
      const r = await fetchItems(layer, { skip: page.skip, limit: page.limit })
      const { pagination, results } = r
      items = items.concat(results)
      page.skip = pagination.next
      page.next = pagination.next
      if (!pagination.next) {
        break
      }
    }
    setProgress(1)
    return items
  })

export const selectedConcepts = createStore(Set())
  .on(nodePicker.merge, (state, vals) => state.union(Set(vals)))
  .on(nodePicker.replace, (_, vals) => Set(vals))
  .on(nodePicker.reset, () => Set())
  .on(nodePicker.remove, (state, vals) => state.subtract(Set(vals)))
  .reset(didPickLayer)

export const userResources = createStore([])
  .on(fetchResources.done, (state, params) => {
    return params.result
  })
  .reset(didPickLayer)

$layerSource
  .watch((layer) => fetchResources({ layer }))

export const setCursor = createEvent()

export const $cursor = createStore({ current: 0, count: 0})
  .on(setCursor, (state, page) => ({ ...state, ...page }))
  .reset(nodePicker.reset)
  .reset(nodePicker.replace)
  .reset(didPickLayer)

