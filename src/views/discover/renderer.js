import { fetchLayer, fetchUpdateLayer, bases } from './layers'
import { ThemeSwitch } from './atlas-theme'
import FileSaver from 'file-saver'
import Mousetrap from '@ilearn/modules/utilities/mousetrap'
import _ from 'lodash'

import setupDebugger from './renderer-debugger'
import { conceptSelection, selectedConcepts } from './store'
import { pickLayer, resourcesDomain } from './store'

// Keyboard shortcuts and their aliases for interacting with map. We would
// pause the event handlers if map layer isn't focused, since otherwise it'd
// break viewport scrolling and navigation.
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
  const allPoints = await fetchLayer('everything')
  const mapShapePoints = allPoints.union(bases.points).toJS()
  const labelledPoints = allPoints.union(bases.labels.filter((p) => p.labelPriority === 1)).toJS()

  const elevation = DotAtlas.createLayer({
    type: 'elevation',
    points: mapShapePoints,

    elevationPow: .1,
    maxRadiusDivider: 13.8,
    contourWidth: 0,
    lightAltitude: 5,
    lightIntensity: .2,
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
    markerStrokeOpacity: .3,
    markerSizeMultiplier: 10,
  })

  const hoverOutline = DotAtlas.createLayer({
    points: [],
    type: 'outline',
    outlineFillColor: [160, 204, 255, 100],
    outlineStrokeColor: [36, 60, 75, 255],
    outlineStrokeWidth: 0.1,

    // How much to offset the outline boundary from the markers.
    outlineRadiusOffset: 10,
    outlineRadiusMultiplier: 15,
  })

  const markers = DotAtlas.createLayer({
    type: 'marker',
    points: allPoints.toJS(),

    markerSizeMultiplier: 5,
    markerStrokeWidth: 0,
    markerOpacity: 0.8,

    minAbsoluteMarkerSize: 0,

    pointHoverRadiusMultiplier: 10,
    onPointHover: (e) => {
      const hoverPts = e.points.filter((pt) => pt.canPick)

      hoverMarkers.set('points', hoverPts)
      hoverOutline.set('points', hoverPts)
      atlas.redraw()
    },
    onPointClick: (e) => {
      const filteredPts = e.points.filter((pt) => pt.canPick)
      if (!(e.ctrlKey || e.shiftKey)) {
        conceptSelection.replace(filteredPts)
      } else {
        conceptSelection.merge(filteredPts)
      }
    },
  })

  const labels = DotAtlas.createLayer({
    type: 'label',
    points: labelledPoints,
    labelFontFamily: 'Barlow',
    labelFontSize: 12,
    labelFontWeight: 400,
    labelFontVariant: 'normal',
    labelOpacity: 1,
  })

  const layers = {
    elevation,
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
    didResizeViewport: (() => {
      // Based on AutoResizing plugin for dotaltas. Reimplemented here with
      // lodash.
      // Basic resizing is fast, as per the comments in the said plugin, however
      // labels need to be updated and that should be throttled.
      // This is an iife, since we want to save the references to throttled
      // handlers.
      const deferredNotifyLabelsUpdate = _.debounce(() => {
        labels.update('labelVisibilityScales')
        atlas.redraw()
      }, 200)
      return () => {
        atlas.resize()
        deferredNotifyLabelsUpdate()
      }
    })(),
  }

  const atlas = DotAtlas
    .with(ThemeSwitch)
    .embed({
      element: conf.element,
      layers: [
        elevation,
        markers,
        selectionOutline,
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
    selectionOutline.set('points', selection.toJS())
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

  const kbdController = new Mousetrap()

  kbdController.bind('c', () => {
    conceptSelection.reset()
  })

  kbdController.bind(kbdCtrlKeys.panning.left, () => {
    mapTransforms.x += -1
  })
  kbdController.bind(kbdCtrlKeys.panning.right, () => {
    mapTransforms.x += 1
  })
  kbdController.bind(kbdCtrlKeys.panning.up, () => {
    mapTransforms.y += -1
  })
  kbdController.bind(kbdCtrlKeys.panning.down, () => {
    mapTransforms.y += 1
  })

  kbdController.bind(kbdCtrlKeys.zooming.plus, () => {
    mapTransforms.zoom += .5
  })
  kbdController.bind(kbdCtrlKeys.zooming.minus, () => {
    mapTransforms.zoom -= .5
  })

  const debugUi = setupDebugger(atlas, layers, conf.element)

  kbdController.bind(kbdCtrlKeys.control.showDevTools, () => {
    debugUi.show()
    if (debugUi.closed) {
      debugUi.open()
    } else {
      debugUi.close()
    }
  })

  kbdController.bind('shift+b', () => {
    FileSaver.saveAs(atlas.get('imageData'), 'atlas-im.png')
  })


  const updateLayers = async (layer) => {
    markers.set('visible', false)
    labels.set('visible', false)
    atlas.redraw()

    const pts = await fetchUpdateLayer(layer)
    let pt

    markers
      .get('points')
      .filter((p) => p.userData)
      .forEach((p) => {
        pt = pts.get(p.wikiDataId)
        if (pt) {
          p.markerOpacity = .8
          p.canPick = true
        } else {
          p.markerOpacity = 0
          p.canPick = false
        }
      })
    markers.set('visible', true)
    markers.update('markerOpacity')

    labels
      .get('points')
      .filter((p) => p.userData)
      .forEach((p) => {
        pt = pts.get(p.wikiDataId)
        if (pt) {
          p.labelOpacity = 1
          p.labelPriority = 0.8
        } else {
          p.labelOpacity = 0
          p.labelPriority = 0
        }
      })
    labels.set('visible', true)
    labels.update('labelOpacity')
    labels.update('labelPriority')
    labels.update('labelVisibilityScales')

    elevation
      .get('points')
      .filter((p) => p.userData)
      .forEach((p) => {
        pt = pts.get(p.wikiDataId)
        if (pt) {
          p.elevation = pt.elevation
        } else {
          p.elevation = 0
        }
      })
    elevation.update('elevation')
    atlas.redraw()
  }

  resourcesDomain.watch(pickLayer, updateLayers)
  updateLayers('user')

  window.addEventListener('resize', eventTaps.didResizeViewport)

  return atlas
}
