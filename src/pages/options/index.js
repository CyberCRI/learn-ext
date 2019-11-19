import React, { Component } from 'react'
import { Card, Elevation, Icon, Button, Popover, Menu, MenuItem, Tag, ButtonGroup } from '@blueprintjs/core'
import clsx from 'classnames'
import _ from 'lodash'
import { motion } from 'framer-motion'

import { renderReactComponent } from '~mixins/react-helpers'
import { request } from '~mixins'
import { WikiCard } from '~components/cards'
import RootAPI, { RuntimeParams } from '~mixins/root-api'

import { hexToRGBA } from '@ilearn/modules/atlas/misc'
import { AutoResizing, Effects } from '@ilearn/modules/atlas/dotatlas'
import { i18n } from '@ilearn/modules/i18n'


const i18nT = i18n.context('pages.discover')

import './style.sass'

const PortalTable = {
  sci: { color: hexToRGBA('3B3C3E') },
  tech: { color: hexToRGBA('10416B') },
  pol: { color: hexToRGBA('2B3546') },
  geo: { color: hexToRGBA('186B4B') },
  hist: { color: hexToRGBA('48392B') },
  art: { color: hexToRGBA('681D33') },
  spo: { color: hexToRGBA('58517B') },
  soc: { color: hexToRGBA('473746') },
}

const black = hexToRGBA('000000')
const white = hexToRGBA('FFFFFF')
const gray = hexToRGBA('333333')
const concept = [92, 37, 92, 255]


const createLayers = (map, dataset, callbacks) => {

  dataset.points.forEach(function (p, index) {
    p.elevation = 0 //p.labelPriority >= 0.2 ? 0.08 : 0.01
    p.marker = p.label ? 'circle' : ''

    p.markerSize = p.label ? .4 : 0
    p.markerColor = PortalTable[p.portal].color

    if (p.label) {
      // Portals + Pages
      p.elevation = 0
      p.labelColor = gray
      p.labelPriority = .3
      p.label = p.label.replace(/_/g, ' ')
      p.title = p.label

      if (p.labelOpacity >= 1) {
        // Top level portals
        p.labelPriority = 1
        p.labelColor = white
        p.labelOpacity = 1
        p.labelBoxOpacity = .8
        p.labelBoxColor = PortalTable[p.portal].color
      } else {
        p.labelOpacity = 0.5
      }
    }
  })

  dataset.overlay.forEach((p, ix) => {
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

  const shownPoints = _.concat(dataset.points, dataset.overlay)

  const labelledPoints = _.filter(shownPoints, 'label')

  const layers = {
    elevation: DotAtlas.createLayer({
      points: shownPoints,
      type: 'elevation',
      contourWidth: 0,
      maxRadiusDivider: 35,
      // elevationPow: .9,
    }),

    hoverMarkers: DotAtlas.createLayer({
      points: [],
      type: 'marker',
      markerFillOpacity: 0.5,
      markerStrokeWidth: 0,
      markerSizeMultiplier: 0,
    }),

    hoverOutline: DotAtlas.createLayer({
      points: [],
      type: 'outline',
      outlineFillColor: [ 255, 255, 255, 100 ],
      outlineStrokeColor: [ 0, 0, 0, 128 ],
      outlineStrokeWidth: 0,

      // How much to offset the outline boundary from the markers.
      outlineRadiusOffset: 1,
      outlineRadiusMultiplier: 10,
    }),

    markers: DotAtlas.createLayer({
      points: labelledPoints,
      type: 'marker',
      markerSizeMultiplier: 5,
      markerFillOpacity: .2,
      markerStrokeWidth: 0,

      pointHoverRadiusMultiplier: 5,
      onPointHover: (e) => {
        layers.hoverMarkers.set('points', e.points)
        layers.hoverOutline.set('points', e.points)
        map.redraw()

        callbacks.onHover && callbacks.onHover({ points: e.points })
      },
    }),

    labels: DotAtlas.createLayer({
      points: labelledPoints,
      type: 'label',
      labelFontFamily: 'Barlow',
      labelFontSize: 14,
      labelFontWeight: 400,
      labelFontVariant: 'normal',
      opacity: 0,
    }),
  }

  return layers
}


const cardVariants = {
  hidden: {
    y: 30,
    opacity: 0,
  },
  mounted: {
    y: 0,
    opacity: 1,
    position: 'relative',
    inset: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  zoomed: {
    y: 0,
    opacity: 1,
    position: 'fixed',
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
  },
}


class MapCard extends Component {
  constructor (props) {
    super(props)
    this.state = {
      pose: 'mounted',
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
    this.didHoverOnMap = this.didHoverOnMap.bind(this)
  }

  async componentDidMount () {
    this.atlas = DotAtlas
      .with(AutoResizing)
      .embed({
        element: this.canvasRef,
        pixelRatio: window.devicePixelRatio || 1,
        layers: [],

        onHover: this.didHoverOnMap,
        onClick: this.didClickOnMap,
      })

    this.user = await RuntimeParams.userInfo()


    requestAnimationFrame(() => {
      this.renderMapLayer()
    })
    // _.defer(this.renderMapLayer)
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

    const dataset = { points, overlay: overlayConcepts }

    // Pass the dotatlas instance reference to attach interactive outlines.
    const layers = createLayers(this.atlas, dataset, { onHover: this.didHoverOnMap })
    this.atlas.set({
      layers: [
        layers.elevation,
        layers.markers,
        layers.hoverOutline,
        layers.hoverMarkers,
        layers.labels,
      ],
    })

    requestAnimationFrame(() => {
      this.atlas.redraw()
      this.atlas.reset()
      this.setState({ atlasReady: true })
    })
  }

  didClickOnMap (e) {
    this.setState({ cardLock: !this.state.cardLock })
  }

  didHoverOnMap (e) {
    const cardPoint = _.chain(e.points || [])
      .filter((x) => x.userData && x.title.length > 0)
      .sortBy((x) => x.elevation)
      .last()
      .value()
    if (cardPoint) {
      this.setState({ cardPoint })
    }
  }

  didChangeOverlay ({ overlayUser, groupId }) {
    this.setState({ overlayUser, groupId }, this.renderMapLayer)
  }

  async didToggleZoom () {
    const pose = this.state.pose === 'zoomed' ? 'mounted' : 'zoomed'
    this.setState({ pose })
  }

  async refreshAtlas () {
    requestAnimationFrame(() => {
      this.atlas.resize()
      this.setState({ atlasReady: true })
    })
  }

  updateAtlas ({ key, value }) {
    this.atlas.set(key, value)
    this.atlas.redraw()
  }

  maybeRenderWikiCard () {
    if (this.state.cardPoint) {
      return <WikiCard title={this.state.cardPoint.title} lang='fr'/>
    }
  }

  render () {
    return (
      <div className='map-card-container'>
        <motion.div initial='hidden' animate={this.state.pose} variants={cardVariants} onAnimationComplete={this.refreshAtlas} layoutTransition={true}>
          <Card elevation={Elevation.FOUR} className={clsx('map-card', {loading: !this.state.atlasReady})}>
            <div className='header'>
              <h3>{i18nT('sections.atlas.title')}</h3>
              <div className='tools'>
                <Button
                  icon={this.state.pose == 'mounted' ? 'maximize' : 'minimize' }
                  minimal
                  onClick={this.didToggleZoom}
                />
              </div>
            </div>

            <div className='toggles bp3-dark'>
              <label>Layers</label>
              <ButtonGroup vertical alignText='left' minimal>
                <Button
                  icon='layout-circle'
                  text={i18nT('sections.atlas.layers.user')}
                  active={this.state.overlayUser === true}
                  onClick={() => this.didChangeOverlay({ overlayUser: true })}/>
                { this.user.groupId !== 'beta' &&
                  <Button
                    icon='layout-group-by'
                    text={i18nT('sections.atlas.layers.group')}
                    active={this.state.groupId === this.user.groupId}
                    onClick={() => this.didChangeOverlay({ overlayUser: false, groupId: this.user.groupId })}/>
                }
                <Button
                  icon='layout-sorted-clusters'
                  text={i18nT('sections.atlas.layers.everything')}
                  active={this.state.groupId === 'beta'}
                  onClick={() => this.didChangeOverlay({ overlayUser: false, groupId: 'beta' })}/>
              </ButtonGroup>
            </div>

            <ul className='contents'>
              {this.maybeRenderWikiCard()}
            </ul>

            <div
              className={clsx('mapbox', { loading: !this.state.atlasReady })}
              ref={(el) => this.canvasRef = el}/>

          </Card>
        </motion.div>
      </div>
    )
  }
}

document.addEventListener('apploaded', () => {
  const baseMapUrl = 'https://noop-pub.s3.amazonaws.com/opt/atlas/atlas-optimal-02.json'
  renderReactComponent('cartography', MapCard, { baseMapUrl })
})
