import { createEvent, createEffect, createStore } from 'effector'
import { Set } from 'immutable'
import { ResourceAPI } from '@ilearn/modules/api'
import _ from 'lodash'
import { conceptIndexSet, resourceIndex, matchQuerySet } from './query-index'

export const conceptSelection = {
  merge: createEvent(),
  reset: createEvent(),
  replace: createEvent(),
  remove: createEvent(),
}

export const pickLayer = createEvent()

export const resourcesDomain = createStore('user')
  .on(pickLayer, (_, layerId) => layerId)

export const fetchResources = createEffect()
  .use(async ({ limit=100, skip=0 }) => {
    const domain = resourcesDomain.getState()
    const response = await ResourceAPI[domain]({ limit, skip })

    if (response.pagination.next) {
      fetchResources({ limit, skip: response.pagination.next })
    }
    return response.results
  })

export const selectedConcepts = createStore(Set())
  .on(conceptSelection.merge, (state, vals) => state.union(Set(vals)))
  .on(conceptSelection.replace, (_, vals) => Set(vals))
  .on(conceptSelection.reset, () => Set())
  .on(conceptSelection.remove, (state, vals) => state.subtract(Set(vals)))
  .reset(pickLayer)

export const conceptsQuerySet = selectedConcepts
  .map((state, args) => conceptIndexSet(state.toJS()))


export const userResources = createStore([])
  .on(fetchResources.done, (state, r) => [...state, ...r.result])
  .reset(pickLayer)

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
  .reset(pickLayer)

resourcesDomain
  .watch(() => fetchResources({}))
