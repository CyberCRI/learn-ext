import { MapLayerAPI } from '@ilearn/modules/api'

const trimLabel = (label) => {
  // If the label has >= 6 words, we'd add '...'.
  // Split the label text on space characters (\s)
  const words = label.split(/\s/)
  if (words.length >= 6) {
    return [...words.slice(0, 5), '...'].join(' ')
  }
  return label
}

const takeValues = (concept, lang) => {
  if (!concept[`title_${lang}`]) {
    return null
  }

  return {
    label: trimLabel(concept[`title_${lang}`]),
    lang,
    title: concept[`title_${lang}`],
  }
}

export const fetchBaseLayer = async () => {
  return await MapLayerAPI.everything()
    .then((nodes) =>
      nodes.map(p => {
        return {
          ...p,
          x: p.x_map_en,
          y: p.y_map_en,
          userData: true,
          ...(takeValues(p, 'en') || takeValues(p, 'fr')),
          elevation: .8,
          markerShape: 'circle',
          markerSize: 4,
          labelOpacity: 1,
          labelPriority: (p.n_items || 1),
        }
      }).filter(p => p.x && p.y))
}
