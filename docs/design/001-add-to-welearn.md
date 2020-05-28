# Designing a UX for Add-to-WeLearn flows

keywords:
- We have this relation at the moment:
  - `Resource >-[is about ]-->  Concept`
- introduce new optional terms that are qualitative attributes () of the `is about` relationship.
  - `Concept  >-[describes]-->  Resource`
  - `Concept  >-[relates  ]-->  Resource`
  - `Concept  >-[questions]-->  Resource`
  - `Concept  >-[disclaims]-->  Resource`
  - `Concept  >-[?]-->  Resource`

ui/dataviz:
- Make the user aware about these relations. Perhaps by showing a map.
- When one adds a concept, we currently make the `is about` relationship.
- This can be a little difficult for the user when annotations are for concepts that are
  implied or mutually understood concepts because it could be too broad, too niche, or
  misinterpreted.

- Make the relations obvious. Show a graph or the map with resource somewhere outside,
  with links to specific concepts on the map.
- [insert mockup of a map with links to concepts, a text box nearby with the concept tag list].


- We can use visualisation with a well-defined statistics as markers.
- Can make the links/tags colored.
