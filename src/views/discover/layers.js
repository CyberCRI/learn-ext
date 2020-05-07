import { MapLayerAPI } from '@ilearn/modules/api'

const PREF_LANG = 'en'

const trimLabel = (label) => {
  // If the label has >= 6 words, we'd add '...'.
  // Split the label text on space characters (\s)
  const words = label.split(/\s/)
  if (words.length >= 6) {
    return [...words.slice(0, 5), '...'].join(' ')
  }
  return label
}

export const fetchBaseLayer = async () => {
  const allNodes = await MapLayerAPI.everything()
  const nodeLUT = []

  // filter nodes having a representation in a certain language.

  for (let node of allNodes) {
    const repr = node.representations.find((repr) => repr.lang === PREF_LANG)

    if (typeof repr !== 'object') {
      continue
    }
    nodeLUT.push({
      ...node,
      ...repr,
      label: trimLabel(repr.title),
      elevation: .8,
      markerShape: 4,
      labelOpacity: 1,
      labelPriority: Math.max(node.n_items, 1),
    })
  }

  return nodeLUT
}

export const fetchPortals = async () => {
  const r = await fetch('https://noop-zip.s3.amazonaws.com/opt/portals_en_v2.json', {
    method: 'get',
    mode: 'cors',
    headers: { 'Content-Type': 'application/json' },
  })
  const levelMap = {
    1: {
      labelPriority: 100,
      labelOpacity: 1,
      labelFontSize: 20,
    },
    2: {
      labelPriority: 5,
      labelOpacity: .8,
      labelFontSize: 15,
    },
    3: {
      labelPriority: 1,
      labelOpacity: .7,
      labelFontSize: 15,
    },
  }
  const nodes = await r.json()
  return nodes
    .filter(p => p.level <= 2)
    .map(p => {
      return {
        ...p,
        label: trimLabel(p.label),
        ...levelMap[p.level],
      }
    })
}
