import _ from 'lodash'
import { Set, Map, OrderedSet } from 'immutable'

import baseMap from '@ilearn/modules/atlas/data/map-base-points.json'
import baseLabels from '@ilearn/modules/atlas/data/map-base-labels.json'
import { MapLayerAPI } from '@ilearn/modules/api'

export const bases = {
  points: OrderedSet(baseMap),
  labels: _(baseLabels).orderBy('title').thru(OrderedSet).value(),
}

const defaultConceptValues = {
  markerShape: 'circle',
  labelColor: [0, 0, 0, 255],
  labelOpacity: 1,
  markerColor: [0, 0, 0, 120],
  markerSize: 2,
  labelPriority: .8,
}

const trimLabel = (label) => {
  // If the label has >= 6 words, we'd add '...'.
  // Split the label text on space characters (\s)
  const words = label.split(/\s/)
  if (words.length >= 6) {
    return [...words.slice(0, 5), '...'].join(' ')
  }
  return label
}

const normaliseConcept = (concept) => {
  // Build a normalised Concept Object.
  // We'd prefer french concept title.
  let label, title, lang
  if (concept.title_fr) {
    label = trimLabel(concept.title_fr)
    title = concept.title_fr
    lang = 'fr'
  } else {
    label = trimLabel(concept.title_en)
    title = concept.title_en
    lang = 'en'
  }
  return {
    x: +concept.x_map_fr,
    y: +concept.y_map_fr,
    userData: true,
    label,
    title,
    lang,

    wikiDataId: concept.wikidata_id,
    elevation: Math.max(concept.elevation, .1),
    ...defaultConceptValues,
  }
}

export const fetchLayer = async (id) => {
  return await MapLayerAPI[id]()
    .then((concepts) => {
      return _(concepts)
        .map(normaliseConcept)
        .filter((p) => p.x && p.y)
        .orderBy('title')
        .thru(OrderedSet)
        .value()
    })
}

export const fetchUpdateLayer = async (id) => {
  const points = await MapLayerAPI[id]()
  return _(points)
    .map((p) => ([ p.wikidata_id, p ]))
    .thru(Map)
    .value()
}
