import React, { Component } from 'react'
import clsx from 'classnames'
import _ from 'lodash'


class Atlas extends Component {
  constructor (props) {
    super(props)

    this.state = {
      ready: false,
    }
    this.processPoints = this.processPoints.bind(this)
    this.draw = this.draw.bind(this)
  }

  componentDidMount () {
    this.atlas = new DotAtlas({
      element: this.canvasRef,
      pixelRatio: 2,
      maxRadiusDivider: 5,
      mapLightAzimuth: 0.4,
      mapLightIntensity: 0.5,
    })
    this.atlasFx = new DotAtlasEffects(this.atlas)
    if (this.props.dataPoints.length) {
      this.draw()
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.props.ready !== prevState.ready) {
      // Ready state changed, so we'll need to refresh the data points and redraw
      this.draw()
    }
  }

  processPoints () {
    // Implement logic for processing the datapoints.
    const red = [200, 0, 0, 255]
    return this.props.dataPoints.map((p, ix) => {
      p.elevation = ix === 0 ? 1 : 0.2
      p.marker = 'circle'
      p.markerSize = 0
      p.markerColor = red
      return p
    })
  }

  resize () {
    this.map.resize()
  }

  draw () {
    const points = this.props.dataPoints
    const elevations = { points }
    const dataObject = {
      layers: [ elevations ],
    }

    this.atlasFx.rollout(dataObject)

    // let azimuth = 0
    // setInterval(() => {
    //   azimuth += 0.1
    //   this.atlas.set('mapLightAzimuth', azimuth)
    //   this.atlas.redraw()
    // }, 200)
    // setInterval(() => {
    //   const { x, y } = _.sample(points)
    //   this.atlas.reset()
    //   setTimeout(() => {
    //     this.atlas.centerPoint(x, y, 10, 1000)
    //   }, 300)
    // }, 5000)
  }

  render () {
    const boxClasses = clsx('atlas', {
      loading: !this.state.ready,
    })
    return (
      <div className={boxClasses} ref={(el) => this.canvasRef = el}/>
    )
  }
}

export default Atlas
