import React, { Component } from 'react'
import { Card, Elevation, Icon, Button, Popover, Menu, MenuItem, Tag } from '@blueprintjs/core'
import posed, { PoseGroup } from 'react-pose'
import clsx from 'classnames'
import _ from 'lodash'

import { renderReactComponent } from '~mixins/utils'
import { request } from '~mixins'
import RootAPI from '~mixins/root-api'

import './_options.sass'

const PortalTable = {
  art: {
    portal: 'arts',
    color: [60, 126, 162, 120],
  },
  geo: {
    portal: 'geographie',
    color: [104, 183, 140, 120],
  },
  hist: {
    portal: 'histoire',
    color: [215, 135, 66, 120],
  },
  pol: {
    portal: 'politique_et_religions_et_croyances',
    color: [118, 78, 162, 120],
  },
  sci: {
    portal: 'sciences_et_medecine',
    color: [152, 54, 109, 120],
  },
  soc: {
    portal: 'societe',
    color: [211, 115, 135, 120],
  },
  spo: {
    portal: 'sport_et_loisirs',
    color: [20, 204, 189, 120],
  },
  tech: {
    portal: 'technologies',
    color: [69, 128, 230, 120],
  },
}

  // Coordinates of points on the map.

  // Assign additional properties to some of the points.
  // These could of course be defined directly in the data above,
  // we use the loop to avoid repetition.
  const red = [200, 0, 0, 255];
function drawCartography (points, container, onHover, onClick, overlay) {
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
    p.markerSize = 0.2;

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
    pixelRatio: 2,
    maxRadiusDivider: 10,
    mapLightAzimuth: 0.4,
    mapLightIntensity: 0.5,
  });

  const dataObject = {
    layers: [
      elevations, // Currently, elevation layer must always be at index 0
      markers,
    ]
  }
  const dotatlasFx = new DotAtlasEffects(dotatlas)
  return { map: dotatlas, fx: dotatlasFx, data: dataObject };
}


const CardBox = posed.div({
  preMount: {
    y: 50,
    opacity: 0,
    transition: {
      duration: 100,
    },
  },

  init: {
    opacity: 1,
    y: 0,
    // width: '100%',
    // height: '100%',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flip: true,
    beforeChildren: true,
    // staggerChildren: 100,
    transition: {
      duration: 300,
      // ease: 'easeIn',
      // delay: 100,
    },
    applyAtStart: {
      position: 'relative',
    },
    // delay: 100,
  },
  zoomed: {
    // position: 'fixed',
    y: 0,
    opacity: 1,
    // width: '95vw',
    // height: '95vh',
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
    flip: true,
    // staggerChildren: 100,
    transition: {
      // type: 'spring',
      duration: 300,
      // delay: 100,
      // ease: 'easeIn',
    },
    applyAtStart: {
      position: 'fixed',

    },
    // delay: 100,
  },
})


class MapCard extends Component {
  constructor (props) {
    super(props)
    this.state = {
      pose: 'init',
      atlasReady: false,
      currentPoints: [],
    }

    this.canvasRef = React.createRef()
    this.didToggleZoom = this.didToggleZoom.bind(this)
    this.refreshAtlas = this.refreshAtlas.bind(this)
    this.updateAtlas = this.updateAtlas.bind(this)

    this.renderMapLayer = this.renderMapLayer.bind(this)
  }

  componentDidMount () {
    _.defer(this.renderMapLayer)
  }

  async renderMapLayer () {
    const points = await request({ url: this.props.baseMapUrl })
    const overlay = await RootAPI.fetchUserMapOverlay()

    // Ensure the overlay object has all these keys set: `x_map_fr`, `y_map_fr`,
    // and `title_fr`. (Since we currently only use the french base map.)
    const overlayFilter = _.conforms({
      title_fr: _.isString,
      x_map_fr: _.isFinite,
      y_map_fr: _.isFinite,
    })
    const overlayConcepts = _.chain(overlay.concepts)
      .filter(overlayFilter)
      .value()

      })
    })
  }




  async didToggleZoom () {
    const pose = this.state.pose === 'zoomed' ? 'init' : 'zoomed'
    this.setState({ atlasReady: false })
    _.delay(() => this.setState({ pose }), 200)
  }

  async refreshAtlas () {
    requestAnimationFrame(() => {
      this.atlas.map.resize()

      requestAnimationFrame(() => {
        this.setState({ atlasReady: true })
      })
    })
  }

  updateAtlas ({ key, value }) {
    this.atlas.set(key, value)
    this.atlas.redraw()
  }

  render () {
    return (
      <div className='map-card-container'>
        <CardBox
          pose={this.state.pose}
          initialPose='preMount'
          onPoseComplete={this.refreshAtlas}>
          <Card elevation={Elevation.FOUR} className={clsx('map-card', {loading: !this.state.atlasReady})}>
            <div className='header'>
              <h3>Your Knowledge Map</h3>
              <div className='tools'>
                <Button
                  icon={this.state.pose == 'init' ? 'maximize' : 'minimize' }
                  minimal
                  onClick={this.didToggleZoom}
                />
                <Button icon='more' minimal/>
              </div>
            </div>

            <ul className='contents'>
              <PoseGroup animateOnMount={true}>
                {false && this.state.fakeTags.map((id) => {
                  return (
                    <InfoCard key={id}>
                      <Tag>{id}</Tag>
                    </InfoCard>
                  )
                })}
              </PoseGroup>
            </ul>

            <div
              className={clsx('mapbox', { xloading: !this.state.atlasReady })}
              ref={(el) => this.canvasRef = el}
            />

          </Card>
        </CardBox>
      </div>
    )
  }
}

document.addEventListener('apploaded', () => {
})
