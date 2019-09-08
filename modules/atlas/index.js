import { Effects, AutoResizing, Theme } from './dotatlas'
import FileSaver from 'file-saver'
import { hexToRGBA } from './misc'

const ThemeChange = new CustomEvent('theme-change', { detail: 'dark' })


const portals = {
  sci: { color: hexToRGBA('3B3C3E') },
  tech: { color: hexToRGBA('10416B') },
  pol: { color: hexToRGBA('2B3546') },
  geo: { color: hexToRGBA('186B4B') },
  hist: { color: hexToRGBA('48392B') },
  art: { color: hexToRGBA('681D33') },
  spo: { color: hexToRGBA('58517B') },
  soc: { color: hexToRGBA('473746') },
}

const fetchLayer = async (layername) => {
  return await fetch(`http://localhost:8503/srv/map-layers/${layername}.json`)
    .then((r) => r.json())
}

const fetchGroupLayer = async (groupId) => {
  return await fetch(`https://ilearn.cri-paris.org/prod/api/map/group?group_id=beta`)
    .then((r) => r.json())
    .then(({ concepts }) => {

    })
}


const getDataset = async () => {
  const baseCoords = await fetchLayer('la-coords-base')
  const labelCoords = await fetchLayer('lb-labels')

  const tieredLabels = labelCoords.map((ox) => {
    return {
      ...ox,
      labelColor: ox.tier === 1 ? hexToRGBA('ffffff') : hexToRGBA('000000'),
      labelPriority: (11 - ox.tier),
      labelOpacity: (11 - ox.tier) / 10,
      labelBoxOpacity: ox.tier === 1 ? 0.8 : null,
      labelBoxColor: portals[ox.portal].color,
      markerColor: ox.tier === 1 ? hexToRGBA('ffffff') : portals[ox.portal].color,
      markerSize: (11 - ox.tier),
      markerOpacity: (11 - ox.tier) / 10,
    }
  })

  const coordsElevation = labelCoords.map((ox) => {
    return { ...ox, elevation: 1 }
  })

  return { baseCoords, labelCoords, tieredLabels, coordsElevation }
}


const createLayers = ({ dataset, callbacks, dotatlas }) => {

  const elevation = DotAtlas.createLayer({
    points: dataset.coordsElevation,
    type: 'elevation',
    contourWidth: 0,
    maxRadiusDivider: 15,
    elevationPow: .9,
  })

  const hoverMarkers = DotAtlas.createLayer({
    points: [],
    type: 'marker',
    markerFillOpacity: 0.5,
    markerStrokeWidth: 0,
    markerSizeMultiplier: 0,
  })

  const hoverOutline = DotAtlas.createLayer({
    points: [],
    type: 'outline',
    outlineFillColor: [ 255, 255, 255, 10 ],
    outlineStrokeColor: [ 0, 0, 0, 128 ],
    outlineStrokeWidth: 0.5,

    // How much to offset the outline boundary from the markers.
    outlineRadiusOffset: 1,
    outlineRadiusMultiplier: 10,
  })

  const markers = DotAtlas.createLayer({
    points: dataset.tieredLabels,
    type: 'marker',
    markerSizeMultiplier: 5,
    markerStrokeWidth: 0,

    pointHoverRadiusMultiplier: 10.0,
    onPointHover: (e) => {
      hoverMarkers.set('points', e.points)
      hoverOutline.set('points', e.points)
      dotatlas.redraw()
    },
  })

  const labels = DotAtlas.createLayer({
    points: dataset.tieredLabels,
    type: 'label',
    labelFontFamily: 'Barlow',
    labelFontSize: 14,
    labelFontWeight: 400,
    labelFontVariant: 'normal',
    opacity: 0,
  })

  return { elevation, markers, labels, hoverMarkers, hoverOutline }
}

const atlasInit = async (node) => {
  const container = document.getElementById(node)
  const bob = document.getElementById('bob')

  const locateBob = () => {
    const [ x, y ] = dotatlas.pointToScreenSpace(bob.dataset.x, bob.dataset.y)
    bob.style.left = `${x}px`
    bob.style.top = `${y}px`
  }

  const dotatlas = DotAtlas
    .with(AutoResizing, Theme)
    .embed({
      element: container,
      layers: [],
      pixelRatio: 2,
      onHover: (e) => {
        locateBob()
      },
      onClick: (e) => {
        bob.dataset.x = e.x
        bob.dataset.y = e.y
        locateBob()
      },
      onMouseWheel: (e) => {
        const zoom = dotatlas.get('zoom')

        locateBob()
        if ((zoom >= 20 && e.delta > 0) || (zoom <= 1 && e.delta < 0)) {
          e.preventDefault()
        }
      },
      onDoubleClick: (e) => console.log(e),
    })

  const dataset = await getDataset()
  const layers = createLayers({ dataset, dotatlas })

  dotatlas.set({
    layers: [
      layers.elevation,
      layers.markers,
      layers.hoverOutline,
      layers.hoverMarkers,
      layers.labels,
    ],
  })

  dotatlas.saveView = () => {
    const blob = dotatlas.get('imageData')
    FileSaver.saveAs(blob, 'atlas.png')
  }

  window.atlas = dotatlas
}


window.addEventListener('load', () => {
  atlasInit('atlas-view')
})
