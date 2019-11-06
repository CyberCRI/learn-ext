import { createEvent, createEffect, createStore } from 'effector'
import { Set } from 'immutable'
import { API } from '@ilearn/modules/api'
import _ from 'lodash'
import { conceptIndexSet, resourceIndex, matchQuerySet } from './query-index'

export const conceptSelection = {
  merge: createEvent(),
  reset: createEvent(),
  replace: createEvent(),
  remove: createEvent(),
}

export const fetchResources = createEffect()
  .use(async ({ limit=100, start=1 }) => {
    const response = await API.resources({ limit, start })
    const offset = response.pagination.start + response.pagination.limit
    if (offset < response.pagination.count) {
      console.log(`[Resources] Fetching next batch <limit: ${limit}, start: ${offset}>`)
      fetchResources({ limit, start: offset })
    }
    return response.results
  })

export const selectedConcepts = createStore(Set())
  .on(conceptSelection.merge, (state, vals) => state.union(Set(vals)))
  .on(conceptSelection.replace, (_, vals) => Set(vals))
  .on(conceptSelection.reset, () => Set())
  .on(conceptSelection.remove, (state, vals) => state.subtract(Set(vals)))

export const conceptsQuerySet = selectedConcepts
  .map((state, args) => conceptIndexSet(state.toJS()))


export const userResources = createStore([])
  .on(fetchResources.done, (state, r) => [...state, ...r.result])

export const userResourcesIndex = userResources
  .map((state) => resourceIndex(state))

export const matchingConceptSet = conceptsQuerySet
  .map((state) => matchQuerySet(userResourcesIndex.getState(), state))

export const matchingResourceSet = matchingConceptSet
  .map((state) => {
    return _(userResources.getState())
      .filter((r) => state.has(r.resource_id))
      .value()
  })
