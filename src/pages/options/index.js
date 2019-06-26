import React, { Component } from 'react'
import { Card, Elevation, Icon, Button, Popover, Menu, MenuItem, Tag } from '@blueprintjs/core'
import posed from 'react-pose'
import clsx from 'classnames'
import _ from 'lodash'

import { renderReactComponent } from '~mixins/utils'
import { request } from '~mixins'
import { WikiCard } from '~components/cards'
import RootAPI, { RuntimeParams } from '~mixins/root-api'

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

const black = [0, 0, 0, 255]
const gray = [40, 40, 40, 255]
const concept = [92, 37, 92, 255]

const initDotAtlas = ({ container, onHover, onClick }) => {
  const map = new DotAtlas({
    element: container,
    pixelRatio: 2,
    maxRadiusDivider: 35,
    mapLightAzimuth: 0.8,
    mapLightIntensity: 0.5,
    mapContourOpacity: 0.8,
    mapContourWidth: 0,
    mapLightness: 0,

    hoverRadiusMultiplier: 20,
    onPointHover: (e) => onHover(e),
    onClick: (e) => onClick(e),
  })

  const fx = new DotAtlasEffects(map)
  return { map, fx }
}

const processPoints = (points, overlay) => {
  points.forEach(function (p, index) {
    p.elevation = 0 //p.labelPriority >= 0.2 ? 0.08 : 0.01
    p.marker = p.label ? 'circle' : ''

    p.markerSize = p.label ? .4 : 0
    p.markerColor = PortalTable[p.portal].color

    if (p.label) {
      // Portals + Pages
      p.elevation = 0
      p.labelColor = gray
      p.labelPriority = 0.5
      p.label = p.label.replace(/_/g, ' ')
      p.title = p.label

      if (p.labelOpacity >= 1) {
        // Top level portals
        p.label = `[${p.label}]`
        p.labelPriority = 1
        p.labelColor = gray
        p.labelOpacity = 1
      } else {
        p.labelOpacity = 0.5
      }
    }
  })

  overlay.forEach((p, ix) => {
    p.x = p.x_map_fr
    p.y = p.y_map_fr
    p.marker = 'triangle'
    p.markerSize = 1
    p.markerColor = concept
    p.labelPriority = .8
    p.labelOpacity = .8

    if (p.title_fr) {
      p.title = p.title_fr
      p.lang = 'fr'
    } else if (p.title_en) {
      p.title = p.title_en
      p.lang = 'en'
    } else {
      p.hidden = true
    }

    p.label = _.truncate(p.title, { length: 15, separator: ' ' })
    p.userData = true
  })

  const shownPoints = _.concat(points, overlay)

  const elevations = { points: shownPoints }
  const markers = {
    points: shownPoints,
    // visible: false,
    type: 'marker',
    markerSizeMultiplier: 15,
    markerOpacity: 1,
    markerStrokeWidth: 0,
  }

  const dataObject = {
    layers: [
      elevations,
      markers,
    ],
  }
  return dataObject
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
      overlayUser: true,
      groupId: '',
      currentPoints: [],
      cardPoint: null,
      cardLock: false,
      lastCardPoint: null,
    }

    // Describe these props to avoid attribute errors.
    this.user = {}

    this.canvasRef = React.createRef()
    this.didToggleZoom = this.didToggleZoom.bind(this)
    this.refreshAtlas = this.refreshAtlas.bind(this)
    this.updateAtlas = this.updateAtlas.bind(this)

    this.renderMapLayer = this.renderMapLayer.bind(this)
    this.didClickOnMap = this.didClickOnMap.bind(this)
    this.didChangeOverlay = this.didChangeOverlay.bind(this)
    this.didHoverOnMap = _.debounce(this.didHoverOnMap, 10).bind(this)
  }

  async componentDidMount () {
    this.atlas = initDotAtlas({
      container: this.canvasRef,
      onHover: this.didHoverOnMap,
      onClick: this.didClickOnMap,
    })
    window.atlas = this.atlas

    _.defer(this.renderMapLayer)
  }

  async fetchBaseMap () {
    return request({ url: this.props.baseMapUrl })
  }

  async fetchOverlay () {
    if (this.state.overlayUser) {
      return RootAPI.fetchUserMapOverlay()
    } else {
      return RootAPI.fetchGroupMapOverlay(this.state.groupId)
    }
  }

  async renderMapLayer () {
    const points = await this.fetchBaseMap()
    const overlay = await this.fetchOverlay()
    // Ensure the overlay object has all these keys set: `x_map_fr`, `y_map_fr`,
    // and `title_fr`. (Since we currently only use the french base map.)
    const overlayFilter = _.conforms({
      x_map_fr: _.isFinite,
      y_map_fr: _.isFinite,
    })
    const overlayConcepts = _.chain(overlay.concepts)
      .filter(overlayFilter)
      .value()

    requestAnimationFrame(() => {
      this.setState({ atlasReady: true })
      requestAnimationFrame(() => {
        this.atlas.fx.replace(processPoints(points, overlayConcepts))
      })
    })
  }

  didClickOnMap (e) {
    this.setState({ cardLock: !this.state.cardLock })
  }

  didHoverOnMap (e) {
    const currentPoints = _.chain(e.points || [])
      .filter((x) => x.title)
      .map('title')
      .value()
    const cardPoint = _.chain(e.points || [])
      .filter((x) => x.userData === true)
      .head()
      .get('title')
      .value()

    if (cardPoint) {
      this.setState({ lastCardPoint: cardPoint })
    }

    this.setState({ currentPoints, cardPoint })
  }

  didChangeOverlay ({ overlayUser, groupId }) {
    this.setState({ overlayUser, groupId }, this.renderMapLayer)
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

  maybeRenderWikiCard () {
    if (this.state.cardLock && this.state.lastCardPoint) {
      return <WikiCard title={this.state.lastCardPoint} lang='fr'/>
    } else if (this.state.cardPoint) {
      return <WikiCard title={this.state.cardPoint} lang='fr'/>
    }
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
              {this.maybeRenderWikiCard()}
            </ul>

            <div
              className={clsx('mapbox', { loading: !this.state.atlasReady })}
              ref={(el) => this.canvasRef = el}
            />

          </Card>
        </CardBox>
      </div>
    )
  }
}

document.addEventListener('apploaded', () => {
  const baseMapUrl = 'https://noop-pub.s3.amazonaws.com/opt/atlas/atlas-optimal-02.json'
  renderReactComponent('cartography', MapCard, { baseMapUrl })
})
