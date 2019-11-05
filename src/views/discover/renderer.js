import { baseLayers } from '@ilearn/modules/atlas/dataset'
import { fetchGroupLayer } from './tools'
import { ThemeSwitch } from './atlas-theme'
import Mousetrap from 'mousetrap'
import _ from 'lodash'

import setupDebugger from './renderer-debugger'
import { didPickConcepts, conceptSelection, selectedConcepts } from './store'

const kbdCtrlKeys = {
  panning: {
    left: ['left', 'a', 'h'],
    right: ['right', 'd', 'l'],
    up: ['up', 'w', 'k'],
    down: ['down', 's', 'j'],
  },
  zooming: {
    plus: ['shift+up', '+', '='],
    minus: ['shift+down', '-'],
  },
  control: {
    clearSelection: ['x', 'delete', 'backspace'],
    resetView: ['esc'],
    showDevTools: ['shift+t', 'd e v'],
  },
}


export const setupMapView = async (conf) => {
  const npts = await fetchGroupLayer('user')
  const apts = _.concat(npts, baseLayers.points)
  const albs = _.concat(npts, baseLayers.labels)

  const elevation = DotAtlas.createLayer({
    type: 'elevation',
    points: apts,

    elevationPow: 1,
    maxRadiusDivider: 15,
    contourWidth: 0.5,
    lightAltitude: 10,
    lightIntensity: .2,
  })

  const selectionMarkers = DotAtlas.createLayer({
    type: 'marker',
    points: [],
    markerFillOpacity: 0,
    markerStrokeWidth: .2,
    markerStrokeOpacity: .5,
    markerSizeMultiplier: 10,
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
    markerFillOpacity: 0,
    markerStrokeWidth: .2,
    markerStrokeOpacity: .5,
    markerSizeMultiplier: 10,
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
    points: albs,

    markerSizeMultiplier: 5,
    markerStrokeWidth: 0,
    markerOpacity: 1,

    minAbsoluteMarkerSize: 0,

    pointHoverRadiusMultiplier: 10,
    onPointHover: (e) => {
      const hoverPts = e.points.filter((pt) => pt.userData)

      hoverMarkers.set('points', hoverPts)
      hoverOutline.set('points', hoverPts)
      atlas.redraw()
    },
    onPointClick: (e) => {
      const filteredPts = e.points.filter((pt) => pt.userData)
      if (!(e.ctrlKey || e.shiftKey)) {
        conceptSelection.replace(filteredPts)
      } else {
        conceptSelection.merge(filteredPts)
      }
    },
  })

  const labels = DotAtlas.createLayer({
    type: 'label',
    points: albs,
    labelFontFamily: 'Barlow',
    labelFontSize: 15,
    labelFontWeight: 400,
    labelFontVariant: 'normal',
    labelOpacity: 1,
  })

  const layers = {
    elevation,
    selectionMarkers,
    selectionOutline,
    hoverMarkers,
    hoverOutline,
    markers,
    labels,
  }

  const eventTaps = {
    didClick: (e, ...args) => {
    },
    didDoubleClick: (e, ...args) => {
    },
    didHover: (e, ...args) => {
    },
    didMouseWheel: (e, ...args) => {
    },
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
      onClick: eventTaps.didClick,
      onHover: eventTaps.didHover,
      onMouseWheel: eventTaps.didMouseWheel,
      onDoubleClick: eventTaps.didDoubleClick,
    })

  selectedConcepts.watch((selection) => {
    selectionOutline.set('points', selection)
    selectionMarkers.set('points', selection)
    atlas.redraw()
  })

  const mapTransforms = {
    get centerPoint () {
      const { height, width } = conf.element.getBoundingClientRect()
      const [ ptx, pty, _ ] = atlas.screenToPointSpace(width / 2, height / 2)
      return { x: ptx, y: pty, zoom: this.zoom }
    },
    set centerPoint ({ x, y, zoom }) {
      atlas.centerPoint(x, y, zoom)
    },

    get zoom () {
      return atlas.get('zoom')
    },
    set zoom (value) {
      this.centerPoint = { ...this.centerPoint, zoom: value }
    },

    get x () {
      return this.centerPoint.x
    },
    set x (value) {
      this.centerPoint = { ...this.centerPoint, x: value }
    },

    get y () {
      return this.centerPoint.y
    },
    set y (value) {
      this.centerPoint = { ...this.centerPoint, y: value }
    },
  }


  Mousetrap.bind('c', () => {
    conceptSelection.reset()
  })

  Mousetrap.bind(kbdCtrlKeys.panning.left, () => {
    mapTransforms.x += -1
  })
  Mousetrap.bind(kbdCtrlKeys.panning.right, () => {
    mapTransforms.x += 1
  })
  Mousetrap.bind(kbdCtrlKeys.panning.up, () => {
    mapTransforms.y += -1
  })
  Mousetrap.bind(kbdCtrlKeys.panning.down, () => {
    mapTransforms.y += 1
  })

  Mousetrap.bind(kbdCtrlKeys.zooming.plus, () => {
    mapTransforms.zoom += .5
  })
  Mousetrap.bind(kbdCtrlKeys.zooming.minus, () => {
    mapTransforms.zoom -= .5
  })

  const debugUi = setupDebugger(atlas, layers, conf.element)

  Mousetrap.bind(kbdCtrlKeys.control.showDevTools, () => {
    debugUi.show()
    if (debugUi.closed) {
      debugUi.open()
    } else {
      debugUi.close()
    }
  })

  return atlas
}
