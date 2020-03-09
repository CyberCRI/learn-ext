/* eslint no-multi-spaces: 0 */
import FileSaver from 'file-saver'
import _throttle from 'lodash/throttle'
import _debounce from 'lodash/throttle'
import Mousetrap from '@ilearn/modules/utilities/mousetrap'

import setupDebugger from './controls'
import { conceptSelection, SelectedConcepts } from './store'
import { pickLayer, ResourcesDomain } from './store'
import { loadInlinedUpdateLayer, loadInlinedLayer } from './layers'

import { LayerProps, KeyBinding } from './consts'



export const setupMapView = async (conf) => {
  const base = await loadInlinedLayer('covid_map')

  const elevation = DotAtlas.createLayer({
    type: 'elevation',
    points: base,
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
    points: base,
    ...LayerProps.markers,

    onPointHover: (e) => {
      const hoverPts = e.points

      hoverMarkers.set('points', hoverPts)
      hoverOutline.set('points', hoverPts)
      console.log(e.points)
      atlas.redraw()
    },
    onPointClick: (e) => {
      const filteredPts = e.points
      if (!(e.ctrlKey || e.shiftKey)) {
        conceptSelection.replace(filteredPts)
      } else {
        conceptSelection.merge(filteredPts)
      }
    },
  })

  const labels = DotAtlas.createLayer({
    type: 'label',
    points: base,
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

  SelectedConcepts.watch((selection) => {
    selectionOutline.set('points', selection.toJS())
    atlas.redraw()
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

  const debugUi = await setupDebugger(atlas, layers, conf.element)
  const keyboardTrigger = new Mousetrap()

  keyboardTrigger
    .bind(KeyBinding.panning.left,  _throttle(() => mapt.x += -1, 200))
    .bind(KeyBinding.panning.right, _throttle(() => mapt.x += 1, 200))
    .bind(KeyBinding.panning.up,    _throttle(() => mapt.y += -1, 200))
    .bind(KeyBinding.panning.down,  _throttle(() => mapt.y += 1, 200))
    .bind(KeyBinding.zooming.plus,  _throttle(() => mapt.zoom += 1, 200))
    .bind(KeyBinding.zooming.minus, _throttle(() => mapt.zoom += -1, 200))
    .bind(KeyBinding.control.clearSelection, () => conceptSelection.reset())
    .bind(KeyBinding.control.downloadView, () => {
      FileSaver.saveAs(atlas.get('imageData'), 'atlas-im.png')
    })
    .bind(KeyBinding.control.showDevTools, () => {
      debugUi.show()
      debugUi.closed
        ? debugUi.open()
        : debugUi.close()
    })

  const updateLayers = async (layer) => {
    markers.set('visible', false)
    labels.set('visible', false)
    atlas.redraw()

    const pts = await loadInlinedUpdateLayer(layer)
    let pt

    markers
      .get('points')
      .filter((p) => p.userData)
      .forEach((p) => {
        pt = pts.get(p.wikidata_id)
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
        pt = pts.get(p.wikidata_id)
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
        pt = pts.get(p.wikidata_id)
        if (pt) {
          p.elevation = pt.elevation
        } else {
          p.elevation = 0.01
        }
      })
    elevation.update('elevation')
    atlas.redraw()
  }

  ResourcesDomain.watch(pickLayer, updateLayers)
  // setTimeout(() => {
  //   updateLayers('covid_map')
  // }, 200)

  window.addEventListener('resize', eventTaps.didResizeViewport)

  return atlas
}
