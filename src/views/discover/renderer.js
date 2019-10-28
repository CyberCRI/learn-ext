import { baseLayers } from '@ilearn/modules/atlas/dataset'
import { fetchGroupLayer } from './tools'
import { ThemeSwitch } from './atlas-theme'

// console.log(Theme, AutoResizing)
const ThemeChange = new CustomEvent('theme-change', { detail: 'dark' })

class AtlasRenderer {
  constructor () {
  }

  get layers () {
    this._atlas.get('layers')
    return {
      elevation: null,
      markers: null,
      selectionMarkers: null,
      selectionOutline: null,
      hoverMarkers: null,
      labels: null,
    }
  }

  _createLayers () {

  }

  replaceData () {
    // Replace the dataset in atlas with new one
  }

  addCallback (func) {
    // Attach a callback function for notifications
  }
}

export const setupInstance = (conf) => {
  const selection = new Set()

  const elevation = DotAtlas.createLayer({
    type: 'elevation',
    points: baseLayers.points,

    elevationPow: 1,
    maxRadiusDivider: 15,
    contourWidth: 0.5,
    lightAltitude: 10,
    lightIntensity: .2,
  })

  const selectionMarkers = DotAtlas.createLayer({
    type: 'marker',
    points: [],
    markerFillOpacity: 1,
  })

  const selectionOutline = DotAtlas.createLayer({
    type: 'outline',
    outlineFillColor: [0x95, 0xD0, 0xDF, 0x55],
    outlineStrokeColor: [0x22, 0x29, 0x30, 0x90],
    outlineStrokeWidth: .4,
    points: [],
    outlineRadiusOffset: 15,
  })

  const hoverMarkers = DotAtlas.createLayer({
    points: [],
    type: 'marker',
    markerFillOpacity: 0.2,
    markerStrokeWidth: 1,
    markerSizeMultiplier: 5,
  })

  const hoverOutline = DotAtlas.createLayer({
    points: [],
    type: 'outline',
    outlineFillColor: [160, 204, 255, 100],
    outlineStrokeColor: [36, 60, 75, 255],
    outlineStrokeWidth: 0.5,

    // How much to offset the outline boundary from the markers.
    outlineRadiusOffset: 10,
    outlineRadiusMultiplier: 15,
  })

  const markers = DotAtlas.createLayer({
    type: 'marker',
    points: baseLayers.labels,

    markerSizeMultiplier: 5,
    markerStrokeWidth: 0,
    markerOpacity: 1,

    minAbsoluteMarkerSize: 0,

    pointHoverRadiusMultiplier: 10,
    onPointHover: (e) => {
      hoverMarkers.set('points', e.points)
      hoverOutline.set('points', e.points)
      atlas.redraw()
    },
    onPointClick: (e) => {
      if (e.ctrlKey) {
        selection.clear()
      }

      if (e.points.length > 0) {
        e.points.forEach((point) => selection.add(point))
      }

      selectionOutline.set('points', Array.from(selection))
      atlas.redraw()
    }
  })

  const labels = DotAtlas.createLayer({
    type: 'label',
    points: baseLayers.labels,
    labelFontFamily: 'Barlow',
    labelFontSize: 15,
    labelFontWeight: 400,
    labelFontVariant: 'normal',
    labelOpacity: 1,
  })

  const didEmitClick = (e) => {
    conf.onClick && conf.onClick(e, selection)
  }

  const atlas = DotAtlas
    .with(ThemeSwitch)
    .embed({
      element: conf.element,
      layers: [
        elevation,
        markers,
        selectionOutline,
        selectionMarkers,
        hoverOutline,
        hoverMarkers,
        labels,
      ],
      pixelRatio: conf.pixelRatio,
      onClick: didEmitClick,
      onMouseWheel: conf.onWheel,
      onDoubleClick: conf.onDoubleClick,
    })

  const update = (points) => {
    elevation.set('points', [...elevation.get('points'), ...points])
    elevation.update('xy')

    labels.set('points', [...labels.get('points'), ...points])
    labels.update('xy')
    labels.update('labelVisibilityScales')
    labels.update('labelOpacity')
    labels.update('labelColor')
    labels.update('labelBoxColor')
    labels.update('labelBoxOpacity')

    markers.set('points', [...markers.get('points'), ...points])
    markers.update('xy')
    markers.update('markerSize')

    markers.update('markerColor')
    markers.update('markerOpacity')
    markers.update('markerShape')

    elevation.update('elevation')

    atlas.redraw()
  }

  window.setTimeout(async () => {
    update(await fetchGroupLayer('user'))
  }, 100)

  return atlas
}
