import * as d3 from 'd3'
import _ from 'lodash'
import { saveAs } from 'file-saver'

import { didPickLayer } from './store'
import { viewportEvent, didGetResources } from './store'

import { CarteSocket } from './carte-ws'


const EXTENTS_EN = {
  // [min, max]
  x: [-8.023, 12.664],
  y: [-7.113, 8.436],
}

const AxesScale = {
  x: d3.scaleLinear().domain(EXTENTS_EN.x).range([0, 1000]),
  y: d3.scaleLinear().domain(EXTENTS_EN.y).range([0, 1000]),
}

const ContourColors = [
  '#b9e3ff',
  '#acd0a5',
  '#94bf8b',
  '#a8c68f',
  '#bdcc96',
  '#d1d7ab',
  '#efebc0',
  '#ded6a3',
  '#d3ca9d',
  '#cab982',
  // '#c09a53',
  '#e0e0e0',
  // '#ececec',
]


function intersect(a, b) {
  return !(
    a.x + a.width < b.x ||
    b.x + b.width < a.x ||
    a.y + a.height < b.y ||
    b.y + b.height < a.y
  )
}

function occlusion(svg) {
  // Occlusion method derived from @bmschmidt's example on observablehq.com.
  // https://observablehq.com/@bmschmidt/finding-text-occlusion-with-quadtrees
  //
  // There is not much changed in here, except it is adapted to be used as
  // a side-effect in a RAF loop.
  const nodes = []
  svg.selectAll('.marker').each((d, i, e) => {
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
    if (!isOccluded) {
      filled.push(d)
    }
  })

  return filled
}


const throttledOcclusion = _.throttle(occlusion, 500)

class ConceptMap {
  constructor (props) {
    this.viz = d3.select('#d3-root')
      .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewbox', '0,0,100,100')

    this.sock = new CarteSocket()

    this.filters = {}

    this.sock
      .on('contours.density', this.renderContours)
      .on('markers.init', this.renderMarkers)
      .on('markers.sample', this.renderMarkers)
      .on('markers.portals', this.renderPortals)
      .on('query.nearby', data => didGetResources(data))

    this.componentDidMount()
  }

  componentDidMount = () => {
    this.zoom = d3.zoom()
      .scaleExtent([.5, 20])
      .on('zoom', this.didZoom)

    this.svg = d3.select(this.viz.node())
    this.svg.call(this.zoom)

    this.contours = this.svg.append('g').attr('class', 'contours')
    this.markers = this.svg.append('g').attr('class', 'markers')
    this.portals = this.svg.append('g').attr('class', 'portals')

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
    return d3.zoomTransform(this.svg.node())
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
      .weight(i => i.w))(items)

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
      .join('text')
        .attr('class', 'marker')
        .attr('transform', i => `translate(${scale.x(i.x)}, ${scale.y(i.y)})`)
        .attr('data-priority', i => i.n_items)
        .text(i => i.title)
        .on('click', (d, i, e) => {
          const payload = {
            source: 'marker',
            data: d,
          }
          // [!todo] this is useful! and we shall use it for facets.
          // window.searchUI.setSearchTerm(d.title)
          viewportEvent.click(payload)
          // this.sock.emit('query.nearby', payload)
        })

    occlusion(this.svg)
  }

  renderPortals = (data) => {
    const scale = this.scale
    this.portals
      .selectAll('.portal')
      .data(data)
      .join('text')
        .attr('class', 'portal')
        .attr('transform', i => `translate(${scale.x(i.x)}, ${scale.y(i.y)})`)
        .text(i => i.title)
  }

  updateTransformation = (transform, scale) => {
    // in-view nodes will have the transform/scale less than zero; greater than 1.

    this.svg.select('g.contours')
      .attr('transform', transform)

    this.svg.selectAll('.marker')
      .attr('transform', i => `translate(${scale.x(i.x)}, ${scale.y(i.y)})`)

    this.svg.selectAll('.portal')
      .attr('transform', i => `translate(${scale.x(i.x)}, ${scale.y(i.y)})`)

    throttledOcclusion(this.svg)
  }

  didZoom = () => {
    this.updateTransformation(this.transform, this.scale)
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
