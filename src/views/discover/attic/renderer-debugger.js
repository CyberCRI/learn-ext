import * as datGui from 'dat.gui'
import { LayerPropConstraints, LayerProps } from './consts'

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
  ...LayerProps,
}

const setupDebugger = (atlas, layers, element) => {
  const ui = new datGui.GUI({
    name: 'Atlas Renderer Debug',
    closeOnTop: true,
    resizable: false,
    hideable: false,
  })

  const ctrlPan = ui.addFolder('Panning Controls')

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

  Object.entries(LayerPropConstraints)
    .forEach(([layerName, props]) => {
      const folder = ui.addFolder(`${layerName}`)
      Object.entries(props).forEach(([property, constraint]) => {
        folder
          .add(stateSet[layerName], property, ...constraint)
          .onChange(layerPropSetter(layers[layerName], property))
      })

      if (layerName === 'labels') {
        folder
          .addColor(stateSet[layerName], 'labelShadowColor')
          .onChange(layerPropSetter(layers[layerName], 'labelShadowColor'))
      }
    })

  ui.close()
  ui.hide()

  return ui
}

export default setupDebugger
