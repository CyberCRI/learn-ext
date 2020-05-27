import { MapLayerAPI } from '@ilearn/modules/api'
import { rgba } from './utils'

const PREF_LANG = 'en'

const trimLabel = (label, nwords=6) => {
  // If the label has >= 6 words, we'd add '...'.
  // Split the label text on space characters (\s)
  const words = label.split(/\s/)
  if (words.length >= nwords) {
    return [...words.slice(0, nwords - 1), '...'].join(' ')
  }
  return label
}

export const fetchBaseLayer = async () => {
  const allNodes = await MapLayerAPI.everything()
  const nodeLUT = []

  // filter nodes having a representation in a certain language.
  // [!hack] for backwards compatibility during transition, we'll also check
  // if `node.representations` exists at all. If not, we'll use the `title_en`
  // and `lang: en` bodge.

  for (let node of allNodes) {
    const dot = {
      ...node,
      elevation: .8,
      markerShape: 4,
      labelOpacity: 1,
      labelPriority: Math.max(node.n_items, 1),
    }

    if (!node.representations) {
      if (node.title_en) {
        nodeLUT.push({
          ...dot,
          lang: 'en',
          label: trimLabel(node.title_en),
          x: node.x_map_en,
          y: node.y_map_en,
          title: node.title_en,
        })
      }
      continue
    }

    const repr = node.representations.find((repr) => repr.lang === PREF_LANG)
    if (repr) {
      nodeLUT.push({
        ...dot,
        ...repr,
        label: trimLabel(repr.title),
      })
    }
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
      labelColor: rgba`252525ff`,
      symbol: '⨳',
    },
    2: {
      labelPriority: 5,
      labelOpacity: 1,
      labelColor: rgba`525252ff`,
      symbol: '⌬',
    },
    3: {
      labelPriority: 1,
      labelOpacity: 1,
      labelColor: rgba`636363ff`,
      symbol: '⌘',
    },
    4: {
      labelPriority: 1,
      labelOpacity: 1,
      labelColor: rgba`636363ff`,
      symbol: '⌘',
    },
    5: {
      labelPriority: 1,
      labelOpacity: 1,
      labelColor: rgba`636363ff`,
      symbol: '⌘',
    },
    6: {
      labelPriority: 1,
      labelOpacity: 1,
      labelColor: rgba`636363ff`,
      symbol: '⌘',
    },
    7: {
      labelPriority: 1,
      labelOpacity: 1,
      labelColor: rgba`636363ff`,
      symbol: '⌘',
    },
  }

  const nodes = await r.json()
  const labs = nodes
    .filter(p => p.level <= 7)
    .map(p => {
      const pt = levelMap[p.level]
      return {
        ...p,
        label: trimLabel(p.label),
        ...pt,
      }
    })
  return labs
}
