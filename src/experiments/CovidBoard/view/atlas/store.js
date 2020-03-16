// Implements a query-index search algorithm to find subset matches in a graph
// like dataset.
//
// We're given a set {R} of resources, R, containing a unique id and a set of
// concepts, {C}. Each concept in set {C} contains another unique id.
//
// Consider a query set of concepts, {C}q.
// Let's define an ordered pair <w, R>, where w is a weight, w >= 0, and
// R ∈ {R}. We'll use `wR` to represent this pair.
//
// The goal here is to build a subset of {R} using:
//  { R.concepts ∈ {C}q ∀ R ∈ {R} }
//
// The weight w is currently defined as:
//  w(R, {C}q) = n(R.concepts ∩ {C}q ∀ R ∈ {R}).
//
// The goal here is to transform {R} with {C}q as:
//  { <wi = w(R, {C}q), Ri> : wi > 0 ∀ Ri ∈ {R} }
import { createEvent, createEffect, createStore } from 'effector'
import { Set, Map } from 'immutable'
import _uniqBy from 'lodash/uniqBy'
import { ResourceAPI } from '@ilearn/modules/api'

export const conceptSelection = {
  merge: createEvent(),
  reset: createEvent(),
  replace: createEvent(),
  remove: createEvent(),
}

export const pickLayer = createEvent()

export const ResourcesDomain = createStore('user')
  .on(pickLayer, (_, layerId) => layerId)

export const fetchResources = createEffect()
  .use(async ({ limit=100, skip=0 }) => {
    const domain = ResourcesDomain.getState()
    const response = await ResourceAPI[domain]({ limit, skip })

    if (response.pagination.next) {
      fetchResources({ limit, skip: response.pagination.next })
    }
    return response.results
  })

export const SelectedConcepts = createStore(Set())
  .on(conceptSelection.merge, (state, vals) => state.union(Set(vals)))
  .on(conceptSelection.replace, (_, vals) => Set(vals))
  .on(conceptSelection.reset, () => Set())
  .on(conceptSelection.remove, (state, vals) => state.subtract(Set(vals)))
  .reset(pickLayer)

export const ConceptsQuerySet = SelectedConcepts
  .map((state, args) => {
    // Transform `concepts` to a set of { concept.wikiDataId }.
    return Set(state.map(c => c.wikidata_id))
  })


export const UserResources = createStore([])
  .on(fetchResources.done, (state, r) => [...state, ...r.result])
  .reset(pickLayer)

export const UserResourcesIndex = UserResources
  .map((state) => {
    // Transform `resources` to a hash table keyed by `resource_id`, mapping to
    // `resource.concepts` set.
    const ix = state.map(r => {
      const conceptIX = Set(r.concepts.map(c => c.wikidata_id))
      return [ r.resource_id, conceptIX ]
    })
    return Map(ix)
  })

export const MatchingConceptSet = ConceptsQuerySet
  .map((state) => {
    const rix = UserResourcesIndex.getState()
    return rix.filter(cix => cix.intersect(state).size > 0)
  })

export const MatchingResourceSet = MatchingConceptSet
  .map((state) => {
    const matches = UserResources.getState()
      .filter(r => state.has(r.resource_id))
    return _uniqBy(matches, 'resource_id')
  })
  .reset(pickLayer)
