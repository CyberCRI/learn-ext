import _ from 'lodash'
import { Map, OrderedSet } from 'immutable'

import { MapLayerAPI } from '@ilearn/modules/api'

const defaultConceptValues = {
  markerShape: 'circle',
  labelOpacity: 1,
  markerSize: 2,
  // labelPriority: .8,
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

const removeQuote = (x) => x.replace('\\', '')

const normaliseConcept = (concept) => {
  // Build a normalised Concept Object.
  // We'd prefer english concept title.
  let label, title, lang
  if (concept.title_en) {
    label = trimLabel(concept.title_en)
    title = concept.title_en
    lang = 'en'
  } else {
    label = trimLabel(concept.title_fr)
    title = concept.title_fr
    lang = 'fr'
  }
  return {
    x: concept.x_map_en,
    y: concept.y_map_en,
    userData: true,
    label,
    title,
    lang,

    wikidata_id: concept.wikidata_id,
    elevation: concept.elevation,
    labelPriority: concept.elevation,
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

export async function loadInlinedLayer (name) {
  const points = JSON.parse(document.querySelector(`script[data-inline="${name}"]`).innerHTML)
  return points.map(normaliseConcept)
}

export async function loadInlinedUpdateLayer (name) {
  const points = await loadInlinedLayer(name)
  return Map(points.map((p) => ([ p.wikidata_id, p ])))
}