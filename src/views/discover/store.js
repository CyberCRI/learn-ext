import { createEvent, createEffect, createStore } from 'effector'
import { Set } from 'immutable'
import { API } from '@ilearn/modules/api'
import Fuse from 'fuse.js'

export const conceptSelection = {
  merge: createEvent(),
  reset: createEvent(),
  replace: createEvent(),
  remove: createEvent(),
}

export const fetchResources = createEffect({
  handler: async () => {
    const resources = await API.resources({ limit: 100 })
    return resources.results
  },
})

export const selectedConcepts = createStore(Set())
  .on(conceptSelection.merge, (state, vals) => state.union(Set(vals)))
  .on(conceptSelection.replace, (_, vals) => Set(vals))
  .on(conceptSelection.reset, () => Set())
  .on(conceptSelection.remove, (state, vals) => state.subtract(Set(vals)))
  .map((state) => state.toJS())


export const userResources = createStore([])
  .on(fetchResources.done, (_, r) => r)

export const userResourcesIndex = userResources
  .map((state) => {
    return new Fuse(state.result, {
      shouldSort: true,
      threshold: 0, // Perfect match
      keys: [
        'concepts.title_fr',
      ],
    })
  })

