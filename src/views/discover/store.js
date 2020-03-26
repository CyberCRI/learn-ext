import { createEvent, createEffect, createStore } from 'effector'
import { Set } from 'immutable'
import _ from 'lodash'
import queryStrings from 'query-string'
import { resourceIndex, matchQuerySet } from './query-index'

/**
 *
 * Bojour! We have some freshly baked _layers_, fried _filters_, and cool _items_.
 * Please choose a _render flavour_, and appropriate _transfer function_.
 * Oh, and don't forget our all-you-can-consume _data sauces_!
 *
 * Would you pay with performance or memory? We also support network payments.
 */

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

export const $layerSource = createStore({})
  .on(didPickLayer, (_, layerId) => layerId)

export const fetchResources = createEffect()
  .use(async ({ layer, limit=400, skip=0 }) => {
    const response = await fetchItems(layer, { limit, skip })
    if (response.pagination.next) {
      fetchResources({ layer, limit, skip: response.pagination.next })
    }
    return response.results
  })

export const selectedConcepts = createStore(Set())
  .on(nodePicker.merge, (state, vals) => state.union(Set(vals)))
  .on(nodePicker.replace, (_, vals) => Set(vals))
  .on(nodePicker.reset, () => Set())
  .on(nodePicker.remove, (state, vals) => state.subtract(Set(vals)))
  .reset(didPickLayer)

export const conceptsQuerySet = selectedConcepts
  .map((state, args) => state.map((c) => c.wikidata_id))


export const userResources = createStore([])
  .on(fetchResources.done, (state, r) => [...state, ...r.result])
  .reset(didPickLayer)

export const userResourcesIndex = userResources
  .map((state) => resourceIndex(state))

export const matchingConceptSet = conceptsQuerySet
  .map((state) => matchQuerySet(userResourcesIndex.getState(), state))

export const matchingResourceSet = matchingConceptSet
  .map((state) => {
    return _(userResources.getState())
      .filter((r) => state.has(r.resource_id))
      .uniqBy('resource_id')
      .value()
  })
  .reset(didPickLayer)

$layerSource
  .watch((layer) => fetchResources({ layer }))
