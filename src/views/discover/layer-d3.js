import * as d3 from 'd3'
import { throttle, sortBy } from 'lodash'
import { saveAs } from 'file-saver'

import { didPickLayer } from './store'
import { viewportEvent, didGetResources } from './store'

import { CarteSocket } from './carte-ws'
import { ContourColors, EXTENTS_EN } from './consts'


const AxesScale = {
  x: d3.scaleLinear().domain(EXTENTS_EN.x).range([0, 1000]),
  y: d3.scaleLinear().domain(EXTENTS_EN.y).range([0, 1000]),
}

const actions = {
  loadPortalConcepts () {
    this.sock.emit('markers.portal_children', { wikidata_id: d.wikidata_id, ...this.filters })
  }
}

function intersect(a, b) {
  return !(
    a.x + a.width < b.x ||
    b.x + b.width < a.x ||
    a.y + a.height < b.y ||
    b.y + b.height < a.y
  )
}

function isBoxVisible(n, k) {
  return (
    (n.top > k.top) &&
    (n.bottom < k.bottom) &&
    (n.left > k.left) &&
    (n.right < k.right))
}

function occlusion(svg, selector) {
  // Occlusion method derived from @bmschmidt's example on observablehq.com.
  // https://observablehq.com/@bmschmidt/finding-text-occlusion-with-quadtrees
  //
  // There is not much changed in here, except it is adapted to be used as
  // a side-effect in a RAF loop.
  const _ti = performance.now()
  const nodes = []
  svg.selectAll(selector).each((d, i, e) => {
    const bbox = e[i].getBoundingClientRect()
    nodes.push({
      priority: +e[i].getAttribute('data-priority'),
      node: e[i],
      marker: d,
      bbox,
      x: bbox.x,
      y: bbox.y,
      width: bbox.width,
      height: bbox.height,
    })
  })

  nodes.sort((a, b) => d3.descending(a.priority, b.priority))

  const filled = []

  nodes.forEach(d => {
    const isOccluded = filled.some(e => intersect(d, e))
    d3.select(d.node)
      .classed('occluded', isOccluded)
      .classed('visible', !isOccluded)
    if (!isOccluded) {
      filled.push(d)
    }
  })

  const _tj = performance.now()
  console.log(`occulsion. took ${_tj - _ti}ms`)
  return filled
}


class ConceptMap {
  constructor (props) {
    this.viz = this.setupVisualisation({ mountAt: '#d3-root' })

    this.sock = new CarteSocket()

    this.filters = {}
    this.states = {
      lastZoom: 0,
    }

    this.sock
      .on('contours.density', this.renderContours)
      .on('markers.init', this.renderMarkers)
      .on('markers.sample', this.renderMarkers)
      .on('markers.portals', this.renderPortals)
      .on('query.nearby', data => didGetResources(data))
      .on('markers.portal_children', this.renderMarkers)

    this.componentDidMount()
  }

  setupVisualisation = ({ mountAt }) => {
    return d3.select(mountAt)
      .call(s => s
        .append('div')
        .attr('class', 'divroot')
        .call(div => div
          .append('div')
          .attr('class', 'layer portals'))
        .call(div => div
          .append('div')
          .attr('class', 'layer markers')))
      .call(s => s
        .append('svg')
        .attr('class', 'maproot')
        .attr('width', '100%')
        .attr('height', '100%')
        .call(s => s
          .append('g')
          .attr('class', 'contours')))
  }

  componentDidMount = () => {
    this.zoom = d3.zoom()
      .scaleExtent([.2, 25])
      .on('zoom', this.didZoom)

    this.svg = d3.select('svg.maproot')
    this.contours = this.svg.select('.contours')

    this.viz_div = d3.select('div.divroot')
    this.portals = d3.select('.layer.portals')
    this.markers = d3.select('.layer.markers')

    this.viz.call(this.zoom)

    viewportEvent.zoom.watch((value) => {
      const scaleFactor = value === 'in' ? 2 : .5
      this.viz
        .transition()
        .duration(300)
        .call(this.zoom.scaleBy, scaleFactor)
    })

    viewportEvent.export.watch(this.serializeCanvas)

    didPickLayer.watch((value) => {
      if (value.user) {
        this.filters = { user: value.src }
      } else {
        this.filters = {}
      }

      this.sock
        .emit('contours.density', this.filters)
        .emit('markers.init', this.filters)
        .emit('markers.portals', this.filters)
    })

    this.sock
      .emit('contours.density', this.filters)
      .emit('markers.init', this.filters)
      .emit('markers.portals', this.filters)
  }

  get scale () {
    const t = this.transform
    const x = t.rescaleX(AxesScale.x).interpolate(d3.interpolateRound)
    const y = t.rescaleY(AxesScale.y).interpolate(d3.interpolateRound)
    return { x, y }
  }

  get transform () {
    //- Get Current zoomTransform
    return d3.zoomTransform(this.viz.node())
  }

  translateToCenter = (x, y) => {
    const { width, height } = this.viz.node().getBoundingClientRect()
    this.viz
      .transition()
      .duration(400)
      .call(this.zoom.translateTo, x, y, [width / 2, height / 2])
  }

  renderContours = (data) => {
    //- geojson contours are rendered with the initial axis scale.
    const { items } = data

    const contours = (d3.contourDensity()
      .size([AxesScale.x(10), AxesScale.y(10)])
      .x(i => AxesScale.x(i.x))
      .y(i => AxesScale.y(i.y))
      .weight(i => Math.max(i.w, i.w2))
      .cellSize(Math.pow(2, 2))
      .thresholds(80))(items)

    //- geojson extents -> for color map
    const contourScale = d3.scaleQuantize()
      .domain(d3.extent(contours.map(i => i.value)))
      .range(ContourColors)

    this.contours
      .selectAll('path')
      .data(contours)
      .join('path')
        .attr('d', d3.geoPath())
        .attr('fill', d => contourScale(d.value))

    this.translateToCenter(350, 500)
  }

  renderMarkers = (data) => {
    const scale = this.scale
    const quantiles = d3.scaleQuantile()
      .domain(d3.extent(data.map(i => i.n_items)))
      .range([0.2, 0.3, 0.4, 0.6, 0.7, 0.8, 0.9, 1])

    this.markers
      .selectAll('.marker')
      .data(data)
      .join('p')
        .attr('class', 'marker interactive')
        .attr('data-priority', i => {
          return i.n_items
        })
        .text(i => i.title)
        .style('transform', i => `translate(${scale.x(i.x)}px, ${scale.y(i.y)}px)`)
        .on('click', (d, i, e) => {
          const payload = {
            source: 'marker',
            data: d,
          }
          viewportEvent.click(payload)
          // this.sock.emit('query.nearby', payload)
        })

    occlusion(this.viz_div, '.marker')
  }

  renderPortals = (data) => {
    const scale = this.scale
    this.portals
      .selectAll('.portal')
      .data(data)
      .join('p')
        .attr('class', 'portal interactive')
        .attr('level', i => i.level)
        .attr('data-priority', i => (10 / i.level) * i.n_child)
        .style('transform', i => `translate(${scale.x(i.x)}px, ${scale.y(i.y)}px)`)
        .text(i => i.title)
        .on('click', d => {
          this.sock.emit('markers.portal_children', { wikidata_id: d.wikidata_id, ...this.filters })
        })
    occlusion(this.viz_div, '.portal')
  }

  updateTransformation = (transform, scale) => {
    // in-view nodes will have the transform/scale less than zero; greater than 1.

    this.svg.select('g.contours')
      .attr('transform', transform)

    this.markers
      .selectAll('.marker')
        .style('transform', i => `translate(${scale.x(i.x)}px, ${scale.y(i.y)}px)`)

    this.portals
      .selectAll('.portal')
        .style('transform', i => `translate(${scale.x(i.x)}px, ${scale.y(i.y)}px)`)
  }

  updateLabelVisibility = throttle(() => {
    // We're fixing the visibility of labels. However we need to ensure the rules
    // are respected for each layer.
    occlusion(this.viz_div, '.marker')
    occlusion(this.viz_div, '.portal')
  }, 400, { trailing: true, leading: true })

  didZoom = (d, i, e) => {
    const t = this.transform
    this.updateTransformation(t, this.scale)

    this.states.lastZoom = t.k
    const zoomChanged = (t.k - this.states.lastZoom) === 0
    if (zoomChanged) {
      this.didCrossZoomTrigger(t)
      this.updateLabelVisibility()
    }
  }

  didCrossZoomTrigger = throttle((t) => {
    const _ti = performance.now()

    const TRANSITION_DURATION = 0 // milli-seconds
    const TRIGGER_BREAKPOINT = 2 // breakpoint at zoom crossing 2.

    const portalContainer = this.viz_div.select('.portals')
    const markerContainer = this.viz_div.select('.markers')

    const labelTransition = d3.transition()
      .duration(TRANSITION_DURATION)

    markerContainer
      .transition(labelTransition)
      .style('opacity', _ => t.k < TRIGGER_BREAKPOINT ? 0 : 1)
      .style('display', _ => t.k < TRIGGER_BREAKPOINT ? 'none' : 'block')

    portalContainer
      .transition(labelTransition)
      .style('opacity', t.k < TRIGGER_BREAKPOINT ? 1 : 0.4)
      .style('font-size', t.k >= TRIGGER_BREAKPOINT ? '1.6em' : '1em')

    this.maybeLoadPortalLabel(t)

    const _tj = performance.now()
    console.log(`didCrossZoomTrigger took ${_tj - _ti}ms`)
  }, 100)

  maybeLoadPortalLabel = throttle((t) => {
    if (t.k > 4) {
      // get prominent portals, pick the one that's top level, and load labels.
      const portals = this.prominentPortals().filter(d => d.level === 1)
      const d = sortBy(portals, ['n_child', 'level'])[0]
      if (d) {
        console.log('loading marks for portal', d)
        this.sock.emit('markers.portal_children', { wikidata_id: d.wikidata_id, ...this.filters })
      }
    }
  }, 300)

  prominentPortals = () => {
    const vizBox = this.viz.node().getBoundingClientRect()
    const visiblePortals = []
    this.portals.selectAll('.portal').each((d, i, e) => {
      const nodeBox = e[i].getBoundingClientRect()
      if (isBoxVisible(nodeBox, vizBox)) {
        visiblePortals.push(d)
      }
    })
    return visiblePortals
  }

  serializeCanvas = () => {
    let svg = this.svg.node().cloneNode(true)
    svg.setAttribute('xlink', 'http://www.w3.org/1999/xlink')

    const svgString = (new XMLSerializer()).serializeToString(svg)
    const blob = new Blob([ svgString ], { type: 'image/svg+xml' })

    saveAs(blob, 'welearn-map.svg')
  }
}

window.d3 = d3

export { ConceptMap }
