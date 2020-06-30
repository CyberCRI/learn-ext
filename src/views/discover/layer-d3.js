import * as d3 from 'd3'
import _ from 'lodash'
import { saveAs } from 'file-saver'

import { nodePicker } from './store'
import { viewportEvent } from './store'

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
  '#c09a53',
  '#e0e0e0',
  '#ececec',
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

    this.sock = new CarteSocket()

    this.sock
      .on('contours.density', this.renderContours)
      .on('markers.init', this.renderMarkers)
      .on('markers.sample', this.renderMarkers)
      .on('markers.portals', this.renderPortals)
      .on('query.nearby', data => console.log(data))

    this.componentDidMount()
  }

  componentDidMount = () => {
    this.zoom = d3.zoom()
      .scaleExtent([.5, 20])
      .on('zoom', this.didZoom)

    this.svg = d3.select(this.viz.node())
      .call(this.zoom)
      .append('g')

    this.contours = this.svg.append('g').attr('class', 'contours')
    this.markers = this.svg.append('g').attr('class', 'markers')
    this.portals = this.svg.append('g').attr('class', 'portals')

    viewportEvent.zoom.watch((value) => {
      this.zoom.scaleBy(this.viz, value === 'in' ? 2 : .5)
    })
    viewportEvent.export.watch(this.serializeCanvas)

    this.sock
      .emit('contours.density')
      .emit('markers.init')
      .emit('markers.portals')

    window.sock = this.sock
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

  renderContours = (data) => {
    //- geojson contours
    const { items, extents } = data

    const contours = (d3.contourDensity()
      .size([this.scale.x(10), this.scale.y(10)])
      .x(i => this.scale.x(i.x))
      .y(i => this.scale.y(i.y))
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
        .attr('data-priority', i => quantiles(i.n_items))
        .text(i => i.title)
        .on('click', (d, i, e) => {
          nodePicker.click({ x: d.x, y: d.y })
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


export { ConceptMap }
