/* eslint no-multi-spaces: 0 */
import FileSaver from 'file-saver'
import Mousetrap from '@ilearn/modules/utilities/mousetrap'
import _throttle from 'lodash/throttle'
import _debounce from 'lodash/debounce'
import _flatMap from 'lodash/flatMap'
import _ from 'lodash'
import * as d3 from 'd3'

import setupDebugger from './renderer-debugger'
import { nodePicker } from './store'

import { LayerProps, KeyBinding } from './consts'


const devu = 'wss://wn-carte.as.noop.pw:8403/carte/ws'
const stageu = 'wss://staging.welearn.cri-paris.org:8403/carte/ws'

class CarteSocket {
  constructor () {
    const sock = new WebSocket(devu)
    sock.addEventListener('open', (e) => this._didOpenConnection(e, sock))
    sock.addEventListener('message', (m) => this._didGetMessage(m))

    this._acts = {}
  }

  get sock () {
    return this._sock
  }

  _didGetMessage (msg) {
    let resp
    try {
      resp = JSON.parse(msg.data)
    } catch {
      console.warn('Cannot parse:', msg)
      return
    }
    if (resp.q && resp.q.act) {
      const { act, ...args } = resp.q
      this._acts[act](resp.r)
    }
  }

  _didOpenConnection (event, sock) {
    console.log(event, sock)
    this._sock = sock
  }

  on = (action, callback) => {
    this._acts[action] = callback
    return this
  }

  emit = (act, args) => {
    if (!this.sock) {
      setTimeout(() => this.emit(act, args), 20)
      return
    }

    if (typeof this._acts[act] === 'function') {
      console.log('here!')
      const payload = { act, ...args }
      console.log('~>', payload)
      this.sock.send(JSON.stringify(payload))
    }
  }
}

const initAtlas = async (conf) => {
  const elevation = DotAtlas.createLayer({
    type: 'elevation',
    points: conf.elevations,
    ...LayerProps.elevation,
  })

  const atlas = DotAtlas
    .embed({
      element: conf.element,
      layers: [elevation],
      pixelRatio: Math.ceil(Math.max(window.devicePixelRatio, 1)),
    })

  const bbox = conf.element.getBoundingClientRect()
  atlas.mapt = {
    get centerPoint () {
      const { height, width } = bbox
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
  window.addEventListener('resize', () => atlas.resize())
  window._magic_atlas = atlas
  const debugUi = setupDebugger(atlas, { elevation }, conf.element)
  const keyboardTrigger = new Mousetrap()

  keyboardTrigger
    .bind(KeyBinding.panning.left,  _throttle(() => atlas.mapt.x += -1, 200))
    .bind(KeyBinding.panning.right, _throttle(() => atlas.mapt.x += 1, 200))
    .bind(KeyBinding.panning.up,    _throttle(() => atlas.mapt.y += -1, 200))
    .bind(KeyBinding.panning.down,  _throttle(() => atlas.mapt.y += 1, 200))
    .bind(KeyBinding.zooming.plus,  _throttle(() => atlas.mapt.zoom += 1, 200))
    .bind(KeyBinding.zooming.minus, _throttle(() => atlas.mapt.zoom += -1, 200))
    .bind(KeyBinding.control.downloadView, () => {
      FileSaver.saveAs(atlas.get('imageData'), 'atlas-im.png')
    })
    .bind(KeyBinding.control.showDevTools, () => {
      debugUi.show()
      debugUi.closed
        ? debugUi.open()
        : debugUi.close()
    })
}

export const setupMapView = async (conf) => {
  const s = new CarteSocket()
  s.on('layer.elev', (points) => {
    initAtlas({ ...conf, elevations: points})
  })
  s.emit('layer.elev')
  return s
}

// export const setupMapView = async (conf) => {
//   // const itemScale = d3.scaleSymlog()
//   //   .domain([_.minBy(baseLayer, 'n_items').n_items, _.maxBy(baseLayer, 'n_items').n_items])
//   //   .range([0.2, 1])
//   //   .clamp(true)
//   const s = new CarteSocket()
//   const portalItems = (await fetchPortals()).filter((i) => i.level <= 2)

//   const elevation = DotAtlas.createLayer({
//     type: 'elevation',
//     points: [],
//     ...LayerProps.elevation,
//   })

//   const selectionOutline = DotAtlas.createLayer({
//     type: 'outline',
//     points: [],
//     ...LayerProps.selectionOutline,
//   })

//   const hoverMarkers = DotAtlas.createLayer({
//     type: 'marker',
//     points: [],
//     ...LayerProps.hoverMarkers,
//   })

//   const hoverOutline = DotAtlas.createLayer({
//     type: 'outline',
//     points: [],
//     ...LayerProps.hoverOutline,
//   })

//   const markers = DotAtlas.createLayer({
//     type: 'marker',
//     points: [],
//     ...LayerProps.markers,

//     onPointHover: (e) => {
//       const hoverPts = e.points.slice(0, 40)

//       hoverMarkers.set('points', hoverPts)
//       hoverOutline.set('points', hoverPts)
//       atlas.redraw()
//     },
//     onPointClick: (e) => {
//       nodePicker.click({ x: e.x, y: e.y, r: .2 })
//     },
//   })

//   const portals = DotAtlas.createLayer({
//     type: 'label',
//     points: portalItems,
//     ...LayerProps.portals,
//     visible: true,
//   })

//   const layers = {
//     elevation,
//     selectionOutline,
//     hoverMarkers,
//     hoverOutline,
//     markers,
//     portals,
//   }

//   const eventTaps = {
//     didClick: (e, ...args) => {
//     },
//     didDoubleClick: (e, ...args) => {
//     },
//     didHover: _.throttle((e, ...args) => {
//     }, 20),
//     didMouseWheel: (e, ...args) => {
//       if (atlas.mapt.zoom > 7) {
//         console.log(':trigger now')
//         markers.set('markerFillOpacity', 1)
//         markers.set('minAbsoluteMarkerSize', 8)
//         atlas.redraw()
//       } else {
//         markers.set('markerFillOpacity', .2)
//         markers.set('minAbsoluteMarkerSize', 2)
//         atlas.redraw()
//       }
//     },
//     didResizeViewport: (() => {
//       // Based on AutoResizing plugin for dotaltas. Reimplemented here with
//       // lodash.
//       // Basic resizing is fast, as per the comments in the said plugin, however
//       // labels need to be updated and that should be throttled.
//       // This is an iife, since we want to save the references to throttled
//       // handlers.
//       const deferredNotifyLabelsUpdate = _debounce(() => {
//         portals.update('labelVisibilityScales')
//         atlas.redraw()
//       }, 200)
//       return () => {
//         atlas.resize()
//         deferredNotifyLabelsUpdate()
//       }
//     })(),
//   }

//   const atlas = DotAtlas
//     .embed({
//       element: conf.element,
//       layers: [
//         elevation,
//         markers,
//         selectionOutline,
//         hoverOutline,
//         hoverMarkers,
//         portals,
//       ],
//       pixelRatio: Math.ceil(Math.max(window.devicePixelRatio, 1)),
//       // onClick: eventTaps.didClick,
//       // onHover: eventTaps.didHover,
//       // onMouseWheel: eventTaps.didMouseWheel,
//       // onDoubleClick: eventTaps.didDoubleClick,
//     })

//   const bbox = conf.element.getBoundingClientRect()


//   atlas.mapt = {
//     get centerPoint () {
//       const { height, width } = bbox
//       const [ ptx, pty, _ ] = atlas.screenToPointSpace(width / 2, height / 2)
//       return { x: ptx, y: pty, zoom: this.zoom }
//     },
//     set centerPoint ({ x, y, zoom }) {
//       atlas.centerPoint(x, y, zoom)
//     },

//     get zoom () {
//       return atlas.get('zoom')
//     },
//     set zoom (value) {
//       // If we let zoom value go below zero, weird things happen. Weird but cool.
//       // publish this state too.
//       this.centerPoint = { ...this.centerPoint, zoom: Math.max(value, 0.05) }
//     },

//     get x () {
//       return this.centerPoint.x
//     },
//     set x (value) {
//       this.centerPoint = { ...this.centerPoint, x: value }
//     },

//     get y () {
//       return this.centerPoint.y
//     },
//     set y (value) {
//       this.centerPoint = { ...this.centerPoint, y: value }
//     },
//   }

//   const debugUi = setupDebugger(atlas, layers, conf.element)
//   const keyboardTrigger = new Mousetrap()

//   keyboardTrigger
//     .bind(KeyBinding.panning.left,  _throttle(() => atlas.mapt.x += -1, 200))
//     .bind(KeyBinding.panning.right, _throttle(() => atlas.mapt.x += 1, 200))
//     .bind(KeyBinding.panning.up,    _throttle(() => atlas.mapt.y += -1, 200))
//     .bind(KeyBinding.panning.down,  _throttle(() => atlas.mapt.y += 1, 200))
//     .bind(KeyBinding.zooming.plus,  _throttle(() => atlas.mapt.zoom += 1, 200))
//     .bind(KeyBinding.zooming.minus, _throttle(() => atlas.mapt.zoom += -1, 200))
//     .bind(KeyBinding.control.clearSelection, () => nodePicker.reset())
//     .bind(KeyBinding.control.downloadView, () => {
//       FileSaver.saveAs(atlas.get('imageData'), 'atlas-im.png')
//     })
//     .bind(KeyBinding.control.showDevTools, () => {
//       debugUi.show()
//       debugUi.closed
//         ? debugUi.open()
//         : debugUi.close()
//     })

//   // const updateLayers = async (pts) => {
//   //   await deactivateLayers()
//   //   let pt, scale

//   //   markers
//   //     .get('points')
//   //     .forEach((p) => {
//   //       pt = pts.get(p.wikidata_id)
//   //       if (pt) {
//   //         scale = itemScale(p.n_items)
//   //         p.markerOpacity = scale
//   //         p.markerSize = scale
//   //         p.canPick = true
//   //       } else {
//   //         p.markerOpacity = 0
//   //         p.canPick = false
//   //       }
//   //     })
//   //   markers.update('markerOpacity')
//   //   markers.update('markerColor')
//   //   markers.update('markerSize')
//   //   elevation
//   //     .get('points')
//   //     .forEach((p) => {
//   //       pt = pts.get(p.wikidata_id)
//   //       if (pt) {
//   //         p.elevation = .8
//   //       } else {
//   //         p.elevation = 0.01
//   //       }
//   //     })
//   //   elevation.update('elevation')

//   //   await activateLayers()
//   // }

//   // selectedConcepts.watch((selection) => {
//   //   selectionOutline.set('points', selection.toJS())
//   //   atlas.redraw()
//   // })


//   window.addEventListener('resize', eventTaps.didResizeViewport)
//   window._magic_atlas = atlas
//   window.d3 = d3

//   const setElevation = (nodes) => {
//     elevation.set('points', nodes)
//     elevation.update('elevation')
//     atlas.redraw()
//   }

//   const setLabels = (nodes) => {
//     nodePicker.replace(nodes)

//     markers.set('points', nodes.map((pt) => {
//       return {
//         markerSize: pt.n_items,
//         markerOpacity: .6,
//         ...pt,
//       }
//     }))
//     markers.update('points')
//     markers.update('markerOpacity')
//     markers.update('markerColor')
//     markers.update('markerSize')

//     atlas.redraw()
//   }

//   s.on('layer.elev', setElevation).on('layer.label', (nodes) => setLabels(nodes))
//   s.emit('layer.elev')
//   s.emit('layer.label', { x: 0, y: 0, r: 0.2 })

//   nodePicker.click.watch((q) => s.emit('layer.label', q))

//   window.s = s

//   return atlas
// }
