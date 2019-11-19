import * as datGui from 'dat.gui'

const stateSet = {
  stats: {
    npts: 0,
    spts: 0,
    x: 0,
    y: 0,
    zoom: 0,
  },
  panning: {
    x: 1,
    y: 1,
    scale: 1,
  },
  elevation: {
    visible: true,
    contourWidth: .5,
    contourOpacity: .5,
    elevationPow: 1,
    lightAltitude: 10,
    lightAzimuth: 0,
    lightIntensity: .2,
    maxRadiusDivider: 15,
    elevationOffset: 0,
    lightness: 0,
    saturation: 0,
  },
  marker: {
    visible: true,
    markerSizeMultiplier: 5,
    markerStrokeWidth: 0,
    markerOpacity: 1,
    minAbsoluteMarkerSize: 0,
    pointHoverRadiusMultiplier: 10,
    markerFillOpacity: 1,
    markerStrokeOpacity: 0,
  },
  labels: {
    visible: true,
    labelFontFamily: 'Barlow',
    labelFontSize: 15,
    labelFontWeight: 400,
    labelFontVariant: 'normal',
    labelOpacity: 1,
  },
}

const setupDebugger = (atlas, layers, element) => {
  const ui = new datGui.GUI({
    name: 'Atlas Renderer Debug',
    closeOnTop: true,
    resizable: false,
  })

  const ctrlPan = ui.addFolder('Panning Controls')
  const ctrlElevation = ui.addFolder('Elevation Layer')
  const ctrlMarkers = ui.addFolder('Marker Layer')
  const ctrlLabels = ui.addFolder('Labels Layer')
  const ctrlColors = ui.addFolder('Color Bands')

  const layerPropSetter = (layer, prop) => {
    return (value) => {
      layer.set(prop, value)
      atlas.redraw()
    }
  }
  const mapTransformSetter = () => {
    atlas.centerPoint(stateSet.panning.x, stateSet.panning.y, stateSet.panning.scale)
  }

  // Setup panning controls:
  ctrlPan
    .add(stateSet.panning, 'x', -20, 20, 1)
    .onChange(mapTransformSetter)
  ctrlPan
    .add(stateSet.panning, 'y', -20, 20, 1)
    .onChange(mapTransformSetter)
  ctrlPan
    .add(stateSet.panning, 'scale', 0, 10, .1)
    .onChange(mapTransformSetter)

  // Setup Elevation Layer controls
  ctrlElevation
    .add(stateSet.elevation, 'visible', true)
    .onChange(layerPropSetter(layers.elevation, 'visible'))
  ctrlElevation
    .add(stateSet.elevation, 'contourWidth', 0, 5, .1)
    .onChange(layerPropSetter(layers.elevation, 'contourWidth'))
  ctrlElevation
    .add(stateSet.elevation, 'lightAltitude', 0, 6, .05)
    .onChange(layerPropSetter(layers.elevation, 'lightAltitude'))
  ctrlElevation
    .add(stateSet.elevation, 'lightIntensity', 0, 5, .05)
    .onChange(layerPropSetter(layers.elevation, 'lightIntensity'))
  ctrlElevation
    .add(stateSet.elevation, 'lightAzimuth', 0, 10, .1)
    .onChange(layerPropSetter(layers.elevation, 'lightAzimuth'))
  ctrlElevation
    .add(stateSet.elevation, 'elevationPow', 0, 10, .1)
    .onChange(layerPropSetter(layers.elevation, 'elevationPow'))
  ctrlElevation
    .add(stateSet.elevation, 'maxRadiusDivider', -10, 50, .1)
    .onChange(layerPropSetter(layers.elevation, 'maxRadiusDivider'))

  ctrlElevation
    .add(stateSet.elevation, 'elevationOffset', -1, 1, .005)
    .onChange(layerPropSetter(layers.elevation, 'elevationOffset'))
  ctrlElevation
    .add(stateSet.elevation, 'lightness', -1, 1, .001)
    .onChange(layerPropSetter(layers.elevation, 'lightness'))
  ctrlElevation
    .add(stateSet.elevation, 'saturation', -1, 1, .001)
    .onChange(layerPropSetter(layers.elevation, 'saturation'))

  // Marker Layer Controls
  ctrlMarkers
    .add(stateSet.marker, 'visible')
    .onChange(layerPropSetter(layers.markers, 'visible'))
  ctrlMarkers
    .add(stateSet.marker, 'markerSizeMultiplier', -1, 20, .5)
    .onChange(layerPropSetter(layers.markers, 'markerSizeMultiplier'))
  ctrlMarkers
    .add(stateSet.marker, 'markerStrokeWidth', 0, 20, .5)
    .onChange(layerPropSetter(layers.markers, 'markerStrokeWidth'))
  ctrlMarkers
    .add(stateSet.marker, 'markerFillOpacity', 0, 1, .05)
    .onChange(layerPropSetter(layers.markers, 'markerFillOpacity'))
  ctrlMarkers
    .add(stateSet.marker, 'markerStrokeOpacity', 0, 1, .05)
    .onChange(layerPropSetter(layers.markers, 'markerStrokeOpacity'))
  ctrlMarkers
    .add(stateSet.marker, 'minAbsoluteMarkerSize', 0, 20, .5)
    .onChange(layerPropSetter(layers.markers, 'minAbsoluteMarkerSize'))
  ctrlMarkers
    .add(stateSet.marker, 'pointHoverRadiusMultiplier', 0, 50, 1)
    .onChange(layerPropSetter(layers.markers, 'pointHoverRadiusMultiplier'))

  // Labels Layer
  ctrlLabels
    .add(stateSet.labels, 'visible')
    .onChange(layerPropSetter(layers.labels, 'visible'))
  ctrlLabels
    .add(stateSet.labels, 'labelFontSize', 8, 32, 1)
    .onChange(layerPropSetter(layers.labels, 'labelFontSize'))

  ui.close()
  ui.hide()

  return ui
}

export default setupDebugger
