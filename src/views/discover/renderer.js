/* eslint no-multi-spaces: 0 */
import FileSaver from 'file-saver'
import Mousetrap from '@ilearn/modules/utilities/mousetrap'
import _throttle from 'lodash/throttle'
import _debounce from 'lodash/debounce'
import _flatMap from 'lodash/flatMap'
import _ from 'lodash'
import { Map } from 'immutable'
import * as d3 from 'd3'

import setupDebugger from './renderer-debugger'
import { nodePicker, selectedConcepts, userResources } from './store'

import { LayerProps, KeyBinding } from './consts'
import { rgba } from './utils'


export const setupMapView = async (conf, { baseLayer, portalNodes }) => {
  const itemScale = d3.scaleSymlog()
    .domain([_.minBy(baseLayer, 'n_items').n_items, _.maxBy(baseLayer, 'n_items').n_items])
    .range([0, 1])
    .clamp(true)

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

    onPointHover: _.throttle((e) => {
      const hoverPts = e.points.filter((pt) => pt.canPick)

      hoverMarkers.set('points', hoverPts)
      hoverOutline.set('points', hoverPts)
      atlas.redraw()
    }, 20),
    onPointClick: (e) => {
      const filteredPts = e.points.filter((pt) => pt.canPick)
      if (!(e.ctrlKey || e.shiftKey)) {
        nodePicker.replace(filteredPts)
      } else {
        nodePicker.merge(filteredPts)
      }
    },
  })

  const portals = DotAtlas.createLayer({
    type: 'label',
    points: portalNodes,
    ...LayerProps.portals,
    visible: true,
  })

  const layers = {
    elevation,
    selectionOutline,
    hoverMarkers,
    hoverOutline,
    markers,
    portals,
  }

  const eventTaps = {
    didClick: (e, ...args) => {
    },
    didDoubleClick: (e, ...args) => {
    },
    didHover: (e, ...args) => {
      elevation.get('elevationAt', e.elementX, e.elementY)
    },
    didMouseWheel: (e, ...args) => {
      if (atlas.mapt.zoom > 7) {
        console.log(':trigger now')
        markers.set('markerFillOpacity', 1)
        markers.set('minAbsoluteMarkerSize', 8)
        atlas.redraw()
      } else {
        markers.set('markerFillOpacity', .2)
        markers.set('minAbsoluteMarkerSize', 2)
        atlas.redraw()
      }
    },
    didResizeViewport: (() => {
      // Based on AutoResizing plugin for dotaltas. Reimplemented here with
      // lodash.
      // Basic resizing is fast, as per the comments in the said plugin, however
      // labels need to be updated and that should be throttled.
      // This is an iife, since we want to save the references to throttled
      // handlers.
      const deferredNotifyLabelsUpdate = _debounce(() => {
        portals.update('labelVisibilityScales')
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
        portals,
      ],
      pixelRatio: Math.ceil(Math.max(window.devicePixelRatio, 1)),
      // onClick: eventTaps.didClick,
      // onHover: eventTaps.didHover,
      // onMouseWheel: eventTaps.didMouseWheel,
      // onDoubleClick: eventTaps.didDoubleClick,
    })


  atlas.mapt = {
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
      // publish this state too.
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
    .bind(KeyBinding.panning.left,  _throttle(() => atlas.mapt.x += -1, 200))
    .bind(KeyBinding.panning.right, _throttle(() => atlas.mapt.x += 1, 200))
    .bind(KeyBinding.panning.up,    _throttle(() => atlas.mapt.y += -1, 200))
    .bind(KeyBinding.panning.down,  _throttle(() => atlas.mapt.y += 1, 200))
    .bind(KeyBinding.zooming.plus,  _throttle(() => atlas.mapt.zoom += 1, 200))
    .bind(KeyBinding.zooming.minus, _throttle(() => atlas.mapt.zoom += -1, 200))
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

    atlas.redraw()
  }

  const activateLayers = async () => {
    markers.set('visible', true)
    markers.update('markerOpacity')
    elevation.update('elevation')
    atlas.redraw()
  }

  const updateLayers = async (pts) => {
    await deactivateLayers()
    let pt, scale

    markers
      .get('points')
      .forEach((p) => {
        pt = pts.get(p.wikidata_id)
        if (pt) {
          scale = itemScale(p.n_items)
          p.markerOpacity = scale
          p.markerSize = scale
          p.canPick = true
        } else {
          p.markerOpacity = 0
          p.canPick = false
        }
      })
    markers.update('markerOpacity')
    markers.update('markerColor')
    markers.update('markerSize')
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
    if (resources && resources.length) {
      console.log(':mark user-resources')
      const items = _flatMap(resources, 'concepts').map((c) => [ c.wikidata_id, c ])
      updateLayers(Map(items))
    }
  })

  const didChangeZoom = () => {
    const zoom = atlas.mapt.zoom
    if (zoom <= 5) {
      markers.set('markerFillOpacity', 0)
      atlas.redraw()
    } else {
      markers.set('markerFillOpacity', 1)
      atlas.redraw()
    }
  }

  window.setInterval(() => {
    didChangeZoom()
  }, 100)

  window.addEventListener('resize', eventTaps.didResizeViewport)
  window._magic_atlas = atlas
  window.d3 = d3

  return atlas
}
