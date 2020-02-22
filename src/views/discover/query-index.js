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
import _ from 'lodash'
import { Set, Map } from 'immutable'

export const conceptIndexSet = (concepts=[]) => {
  // Transform `concepts` to a set of { concept.wikiDataId }.
  return _(concepts)
    .map((c) => c.wikidata_id || c.wikiDataId)
    .thru(Set)
    .value()
}

export const resourceIndex = (resources) => {
  // Transform `resources` to a hash table keyed by `resource_id`, mapping to
  // `resource.concepts` set.
  return _(resources)
    .map((r) => ([ r.resource_id, conceptIndexSet(r.concepts) ]))
    .thru(Map)
    .value()
}

export const matchQuerySet = (resIndex, queryIndex) => {
  return resIndex.filter((cset) => cset.intersect(queryIndex).size > 0)
}
