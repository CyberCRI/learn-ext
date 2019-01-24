import React, { Component } from 'react'
import clsx from 'classnames'


class AtlasBox extends Component {
  constructor (props) {
    super(props)

    this.state = {
      ready: false,
    }
  }

  componentDidMount () {
    this.atlas = new DotAtlas({
      element: this.canvasRef,
      pixelRatio: window.devicePixelRatio || 1,
    })
    this.atlasFx = new DotAtlasEffects(this.atlas)
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.props.ready !== prevState.ready) {
      // Ready state changed, so we'll need to refresh the data points and redraw
      this.setState({ ready: })
      this.drawAtlas()
    }

  }

  drawAtlas () {
    const { points } = this.props
    const elevations = { points }
    const dataObject = {
      layers: [ elevations ],
    }

    this.atlasFx.rollout(dataObject)
  }

  render () {
    return (
      <div className={clsx('atlas')} ref={(el) => this.canvasRef = el} />
    )
  }
}

function drawCartography (points, container) {
  // Coordinates of points on the map.

  // Assign additional properties to some of the points.
  // These could of course be defined directly in the data above,
  // we use the loop to avoid repetition.
  const red = [200, 0, 0, 255];
  points.forEach(function (p, index) {
    // Elevation of the point on the 0..1 scale.
    // Zero elevation will not contribute to the height map,
    // but may still display markers or labels, if defined.
    p.elevation = index === 0 ? 1 : 0.2;

    // To display a marker, the point must have a non-empty "marker" property.
    // The property defines shape of the marker: "circle", "square", "triangle".
    p.marker = "circle";

    // Marker size on the 0..1 scale. Zero marker size will draw markers
    // of very small sizes, near to 1 pixel. This might be useful for
    // drawing hundreds of thousands of markers.
    p.markerSize = 0;

    // Color of the marker. The required format is a 4-element RGBA array,
    // with each component value in the 0..255 range.
    // Tip: you can reuse array references for same-colored markers.
    p.markerColor = red;
  });

  // Define layers.

  // Currently, the elevations layer is special: this is the only layer that can define
  // point elevations and labels. Bounding box of the map and hover events are computed
  // only for points on this layer. The special status is likely to be removed before
  // the first official release.
  const elevations = { points: points };

  // Point markers layer, draws point markers (circles in this example) on top
  // of the elevation layer. The markerSizeMultiplier defines how large in pixels
  // a marker with markerSize = 1 should be.
  const markers =    { points: points, type: "marker", markerSizeMultiplier: 10 };

  // Initialize dotAtlas
  const dotatlas = new DotAtlas({
    element: container,
    dataObject: {
      layers: [
        elevations, // Currently, elevation layer must always be at index 0
        markers
      ]
    },
    pixelRatio: window.devicePixelRatio || 1
  });
  return dotatlas;
}
