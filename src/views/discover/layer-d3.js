import React from 'react'
import * as d3 from 'd3'
import styled from 'styled-components'
import { saveAs } from 'file-saver'

import { fetchJSON } from './utils'
import { nodePicker } from './store'
import { viewportEvent } from './store'

const D3Svg = styled.svg`
  width: 100%;
  height: 100%;
`

function intersect(a, b) {
  return !(
    a.x + a.width < b.x ||
    b.x + b.width < a.x ||
    a.y + a.height < b.y ||
    b.y + b.height < a.y
  )
}

function occlusion(svg) {
  const texts = []
  svg.selectAll('text').each((d, i, e) => {
    const bbox = e[i].getBoundingClientRect()
    texts.push({
      priority: +e[i].getAttribute('data-priority'),
      node: e[i],
      text: d,
      bbox,
      x: bbox.x,
      y: bbox.y,
      width: bbox.width,
      height: bbox.height,
    })
  })

  texts.sort((a, b) => d3.descending(a.priority, b.priority))

  const filled = []

  texts.forEach(d => {
    const isOccluded = filled.some(e => intersect(d, e))
    d3.select(d.node).classed('occluded', isOccluded)
    if (!isOccluded) {
      filled.push(d)
    }
  })

  return filled
}

class ConceptMap extends React.Component {
  constructor (props) {
    super(props)
    this.attrs = {
      scaleBounds: [0, 8],
      viewBox: [0, 0, 1000, 1000],
    }

    this.viz = React.createRef()
    this.zoom = d3
      .zoom()
      .scaleExtent([1, 10])
      .on('zoom', this.didZoom)
  }

  componentDidMount () {
    const { width, height } = this.viz.current.getBoundingClientRect()

    this.svg = d3.select(this.viz.current)
      .attr('viewBox', [0, 0, width, height])
      .call(this.zoom)
      .append('g')

    viewportEvent.zoom.watch((value) => {
      this.svg.transition().call(this.zoom.scaleBy, value === 'in' ? 2 : .5)
    })

    viewportEvent.export.watch(() => this.serializeCanvas())

    this.renderVisualisation()
  }

  renderVisualisation = async () => {
    const data = await fetchJSON('//staging.welearn.cri-paris.org:8403/carte/d3/labels')

    const [x_min, x_max] = d3.extent(data.map(i => i.x))
    const [y_min, y_max] = d3.extent(data.map(i => i.y))
    const factor = 100

    const x_rescale = (x) => (x - x_min) * factor
    const y_rescale = (y) => (y - y_min) * factor

    const x_span = (x_max - x_min) * factor
    const y_span = (y_max - y_min) * factor

    const contours = (d3.contourDensity()
      .size([x_span, y_span])
      .x(i => x_rescale(i.x))
      .y(i => x_rescale(i.y))
      .weight(i => i.elevation))(data)

    const [min_ext, max_ext] = d3.extent(contours.map(i => i.value))

    const viridis = (d) => d3.interpolateCool((d - min_ext) / (max_ext - min_ext))

    this.svg
      .append('g')
        .attr('class', 'contours')
      .selectAll('path')
      .data(contours)
      .join('path')
        .attr('d', d3.geoPath())
        .attr('fill', d => viridis(d.value))

    const nodes = this.svg
      .append('g')
        .attr('class', 'labels')
      .selectAll('text')
      .data(data)
      .enter()
        .append('g')
          .attr('class', 'marker')
          .attr('transform', (i) => `translate(${x_rescale(i.x)}, ${y_rescale(i.y)})`)

    nodes
      .append('text')
        .text(i => i.title)
        .attr('dy', 10)
        .attr('data-priority', i => i.elevation)
    nodes
      .append('circle')
        .attr('r', 2)

    this.svg
      .selectAll('.labels text')
      .on('click', (d, i, e) => nodePicker.click({ x: d.x, y: d.y, r: 4 }))

    occlusion(this.svg)
  }

  didZoom = () => {
    this.svg.attr('transform', d3.event.transform)
  }

  serializeCanvas = () => {
    let svg = this.svg.node().cloneNode(true)
    svg.setAttribute('xlink', 'http://www.w3.org/1999/xlink')

    const svgString = (new XMLSerializer()).serializeToString(svg)
    const blob = new Blob([ svgString ], { type: 'image/svg+xml' })

    saveAs(blob, 'welearn-map.svg')
  }

  render () {
    return <D3Svg ref={this.viz}/>
  }
}


export { ConceptMap }
