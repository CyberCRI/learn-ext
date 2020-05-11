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
      labelFontSize: 20,
      labelColor: rgba`c22222ff`,
      symbol: '⨳',
    },
    2: {
      labelPriority: 5,
      labelOpacity: .8,
      labelFontSize: 15,
      labelColor: rgba`228222ff`,
      symbol: '⌬',
    },
    3: {
      labelPriority: 1,
      labelOpacity: .7,
      labelFontSize: 15,
      labelColor: rgba`2222c2ff`,
      symbol: '⌘',
    },
  }

  const acad = [
    {
        "wikidata_id": "Q34749",
        "level": 1,
        "label": "🏛",
        "x": -0.397,
        "y": -0.001
    },
    {
        "wikidata_id": "Q7991",
        "level": 1,
        "label": "🔭",
        "x": -0.826,
        "y": -0.342
    },
    {
        "wikidata_id": "Q816264",
        "level": 1,
        "label": "Formal science",
        "x": -0.343,
        "y": -0.427
    },
    {
        "wikidata_id": "Q80083",
        "level": 1,
        "label": "Humanities",
        "x": -0.253,
        "y": -0.189
    },
    {
        "wikidata_id": "Q8134",
        "level": 2,
        "label": "Economics",
        "x": -0.737,
        "y": 0.612
    },
    {
        "wikidata_id": "Q395",
        "level": 2,
        "label": "Mathematics",
        "x": -2.718,
        "y": 3.154
    },
    {
        "wikidata_id": "Q7748",
        "level": 2,
        "label": "Law",
        "x": -0.516,
        "y": 1.178
    },
    {
        "wikidata_id": "Q413",
        "level": 2,
        "label": "Physics",
        "x": -3.403,
        "y": 2.835
    },
    {
        "wikidata_id": "Q420",
        "level": 2,
        "label": "🔬",
        "x": -3.324,
        "y": 1.598
    },
    {
        "wikidata_id": "Q2018526",
        "level": 2,
        "label": "🎨",
        "x": 0.472,
        "y": -1.323
    },
    {
        "wikidata_id": "Q9418",
        "level": 2,
        "label": "👩‍⚕️",
        "x": -0.892,
        "y": 0.5
    },
    {
        "wikidata_id": "Q34178",
        "level": 2,
        "label": "Theology",
        "x": -0.266,
        "y": -0.715
    },
    {
        "wikidata_id": "Q4830453",
        "level": 2,
        "label": "Business",
        "x": -0.481,
        "y": 1.264
    },
    {
        "wikidata_id": "Q11023",
        "level": 2,
        "label": "Engineering",
        "x": -2.192,
        "y": 1.933
    },
    {
        "wikidata_id": "Q11190",
        "level": 2,
        "label": "Medicine",
        "x": -2.115,
        "y": 1.259
    },
    {
        "wikidata_id": "Q36442",
        "level": 2,
        "label": "Political science",
        "x": -0.449,
        "y": 0.103
    },
    {
        "wikidata_id": "Q315",
        "level": 2,
        "label": "Language",
        "x": -0.945,
        "y": 0.027
    },
    {
        "wikidata_id": "Q23498",
        "level": 2,
        "label": "Archaeology",
        "x": -1.716,
        "y": 0.809
    },
    {
        "wikidata_id": "Q8008",
        "level": 2,
        "label": "Earth science",
        "x": -4.078,
        "y": 2.64
    },
    {
        "wikidata_id": "Q21201",
        "level": 2,
        "label": "Sociology",
        "x": -0.362,
        "y": -0.067
    },
    {
        "wikidata_id": "Q8242",
        "level": 2,
        "label": "📖",
        "x": 0.793,
        "y": -1.469
    },
    {
        "wikidata_id": "Q309",
        "level": 2,
        "label": "📙",
        "x": -0.324,
        "y": -0.279
    },
    {
        "wikidata_id": "Q2329",
        "level": 2,
        "label": "🧪",
        "x": -3.193,
        "y": 2.445
    },
    {
        "wikidata_id": "Q5891",
        "level": 2,
        "label": "Philosophy",
        "x": -0.223,
        "y": -0.635
    },
    {
        "wikidata_id": "Q336",
        "level": 2,
        "label": "Science",
        "x": -0.414,
        "y": -0.136
    },
    {
        "wikidata_id": "Q3510521",
        "level": 3,
        "label": "Computer security",
        "x": 1.405,
        "y": 0.956
    },
    {
        "wikidata_id": "Q210506",
        "level": 3,
        "label": "🧬",
        "x": -4.023,
        "y": 1.685
    },
  ]

  const nodes = await r.json()
  const labs = nodes
    .filter(p => p.level <= 2)
    .map(p => {
      const pt = levelMap[p.level]
      return {
        ...p,
        label: trimLabel(pt.symbol + ' ' + p.label),
        ...pt,
      }
    })
  return [...labs, ...acad]
}
