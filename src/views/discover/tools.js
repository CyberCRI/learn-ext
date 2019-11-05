import _ from 'lodash'
import store from '~mixins/persistence'

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
  const user = await store.get('user')
  if (!user.signedIn) {
    throw new Error('Not Signed In')
  }
  const layers = {
    group: `https://welearn.noop.pw/api/map?group_id=${user.groupId}`,
    user: `https://welearn.noop.pw/api/map?user_id=${user.uid}`,
    all: 'https://welearn.noop.pw/api/map',
  }
  return await fetch(layers.all)
    .then((r) => r.json())
    .then((concepts) => {
      return concepts
        .map(normaliseConcept)
        .filter((p) => p.x && p.y)
    })
}
