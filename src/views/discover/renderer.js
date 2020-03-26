/* eslint no-multi-spaces: 0 */
import FileSaver from 'file-saver'
import Mousetrap from '@ilearn/modules/utilities/mousetrap'
import _throttle from 'lodash/throttle'
import _debounce from 'lodash/debounce'
import _flatMap from 'lodash/flatMap'
import { Map } from 'immutable'

import setupDebugger from './renderer-debugger'
import { nodePicker, selectedConcepts, userResources } from './store'

import { LayerProps, KeyBinding } from './consts'



export const setupMapView = async (conf, baseLayer) => {
  const elevation = DotAtlas.createLayer({
    type: 'elevation',
    points: baseLayer,
    ...LayerProps.elevation,
  })

  const selectionOutline = DotAtlas.createLayer({
    type: 'outline',
    points: [],
    ...LayerProps.selectionOutline,
  })

  const hoverMarkers = DotAtlas.createLayer({
    type: 'marker',
    points: [],
    ...LayerProps.hoverMarkers,
  })

  const hoverOutline = DotAtlas.createLayer({
    type: 'outline',
    points: [],
    ...LayerProps.hoverOutline,
  })

  const markers = DotAtlas.createLayer({
    type: 'marker',
    points: baseLayer,
    ...LayerProps.markers,

    onPointHover: (e) => {
      const hoverPts = e.points.filter((pt) => pt.canPick)

      hoverMarkers.set('points', hoverPts)
      hoverOutline.set('points', hoverPts)
      atlas.redraw()
    },
    onPointClick: (e) => {
      const filteredPts = e.points.filter((pt) => pt.canPick)
      if (!(e.ctrlKey || e.shiftKey)) {
        nodePicker.replace(filteredPts)
      } else {
        nodePicker.merge(filteredPts)
      }
    },
  })

  const labels = DotAtlas.createLayer({
    type: 'label',
    points: baseLayer,
    ...LayerProps.labels,
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
      const deferredNotifyLabelsUpdate = _debounce(() => {
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
      pixelRatio: Math.ceil(Math.max(window.devicePixelRatio, 1)),
      onClick: eventTaps.didClick,
      onHover: eventTaps.didHover,
      onMouseWheel: eventTaps.didMouseWheel,
      onDoubleClick: eventTaps.didDoubleClick,
    })


  const mapt = {
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
      // If we let zoom value go below zero, weird things happen. Weird but cool.
      this.centerPoint = { ...this.centerPoint, zoom: Math.max(value, 0.05) }
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

  const debugUi = setupDebugger(atlas, layers, conf.element)
  const keyboardTrigger = new Mousetrap()

  keyboardTrigger
    .bind(KeyBinding.panning.left,  _throttle(() => mapt.x += -1, 200))
    .bind(KeyBinding.panning.right, _throttle(() => mapt.x += 1, 200))
    .bind(KeyBinding.panning.up,    _throttle(() => mapt.y += -1, 200))
    .bind(KeyBinding.panning.down,  _throttle(() => mapt.y += 1, 200))
    .bind(KeyBinding.zooming.plus,  _throttle(() => mapt.zoom += 1, 200))
    .bind(KeyBinding.zooming.minus, _throttle(() => mapt.zoom += -1, 200))
    .bind(KeyBinding.control.clearSelection, () => nodePicker.reset())
    .bind(KeyBinding.control.downloadView, () => {
      FileSaver.saveAs(atlas.get('imageData'), 'atlas-im.png')
    })
    .bind(KeyBinding.control.showDevTools, () => {
      debugUi.show()
      debugUi.closed
        ? debugUi.open()
        : debugUi.close()
    })

  const deactivateLayers = async () => {
    markers.set('visible', false)
    labels.set('visible', false)

    atlas.redraw()
  }

  const activateLayers = async () => {
    markers.set('visible', true)
    markers.update('markerOpacity')
    labels.set('visible', true)
    labels.update('labelOpacity')
    labels.update('labelPriority')
    labels.update('labelVisibilityScales')
    elevation.update('elevation')
    atlas.redraw()
  }

  const updateLayers = async (pts) => {
    await deactivateLayers()
    let pt

    markers
      .get('points')
      .forEach((p) => {
        pt = pts.get(p.wikidata_id)
        if (pt) {
          p.markerOpacity = Math.max(0.5, 1 - (1 / (p.n_items || 1)))
          p.canPick = true
        } else {
          p.markerOpacity = 0
          p.canPick = false
        }
      })
    markers.update('markerOpacity')

    labels
      .get('points')
      .forEach((p) => {
        pt = pts.get(p.wikidata_id)
        if (pt) {
          p.labelOpacity = 1
          p.labelPriority = Math.max(0.1, 1 - (1 / (p.n_items || 1)))
        } else {
          p.labelOpacity = 0
          p.labelPriority = 0
        }
      })
    labels.update('labelOpacity')
    labels.update('labelPriority')
    labels.update('labelVisibilityScales')

    elevation
      .get('points')
      .forEach((p) => {
        pt = pts.get(p.wikidata_id)
        if (pt) {
          p.elevation = .8
        } else {
          p.elevation = 0.01
        }
      })
    elevation.update('elevation')

    await activateLayers()
  }
  deactivateLayers()

  selectedConcepts.watch((selection) => {
    selectionOutline.set('points', selection.toJS())
    atlas.redraw()
  })
  userResources.watch((resources) => {
    const items = _flatMap(resources, 'concepts').map((c) => [ c.wikidata_id, c ])
    updateLayers(Map(items))
  })

  window.addEventListener('resize', eventTaps.didResizeViewport)

  return atlas
}
