/* eslint no-multi-spaces: 0 */
import { rgba } from './utils'
import { ContourPalette } from './contour-bands'

// Keyboard shortcuts and their aliases for interacting with map. We would
// pause the event handlers if map layer isn't focused, since otherwise it'd
// break viewport scrolling and navigation.
export const KeyBinding = {
  panning: {
    left:   ['left', 'a', 'h'],
    right:  ['right', 'd', 'l'],
    up:     ['up', 'w', 'k'],
    down:   ['down', 's', 'j'],
  },
  zooming: {
    plus:   ['shift+up', '+', '='],
    minus:  ['shift+down', '-'],
  },
  control: {
    clearSelection: ['x', 'delete', 'backspace'],
    resetView:      ['esc'],
    showDevTools:   ['shift+t', 'd e v'],
    downloadView:   ['shift+b'],
  },
}

export const LayerProps = {
  elevation: {
    colorBands:       ContourPalette,
    contourWidth:     0,
    elevationOffset:  0,
    elevationPow:     1,
    lightAltitude:    0,
    lightAzimuth:     4.5,
    lightIntensity:   .2,
    lightness:        -0.01,
    maxRadiusDivider: 22,
    saturation:       0.09,
    visible:          true,
  },
  selectionOutline: {
    outlineFillColor:     rgba`#95d0df99`,
    outlineRadiusOffset:  10,
    outlineStrokeColor:   rgba`#22293044`,
    outlineStrokeWidth:   .5,
    visible: true,
  },
  hoverMarkers: {
    markerFillOpacity:    0,
    markerSizeMultiplier: 5,
    markerStrokeOpacity:  .3,
    markerStrokeWidth:    .2,
    visible: true,
  },
  hoverOutline: {
    outlineFillColor:         rgba`#a0ccff64`,
    outlineRadiusMultiplier:  10,
    outlineRadiusOffset:      2,
    outlineStrokeColor:       rgba`#243c4bc8`,
    outlineStrokeWidth:       0.5,
    visible: true,
  },
  markers: {
    markerColor:          rgba`#151515ff`,
    markerFillOpacity:    .8,
    markerOpacity:        1,
    markerSizeMultiplier: 5,
    markerStrokeOpacity:  0,
    markerStrokeWidth:    0,
    minAbsoluteMarkerSize: 4,
    pointHoverRadiusMultiplier: 10,
    visible: true,
  },
  portals: {
    labelColor:         rgba`#000000ff`,
    labelFontFamily:    'Barlow',
    labelFontSize:      14,
    labelFontVariant:   'normal',
    labelFontWeight:    500,
    labelOpacity:       1,
    labelShadowColor:   rgba`#ffffff99`,
    labelShadowSize:    2,
    visible: true,
  },
}

// Used with dat.GUI for control properties.
export const LayerPropConstraints = {
  elevation: {
    contourWidth:             [0,   10, .1],
    elevationOffset:          [-1,  1,  .001],
    elevationPow:             [0,   10, .1],
    lightAltitude:            [0,   10, .1],
    lightAzimuth:             [0,   10, .1],
    lightIntensity:           [0,   10, .1],
    lightness:                [-1,  1,  .001],
    maxRadiusDivider:         [-10, 50, .1],
    saturation:               [-1,  1,  .001],
    visible: [true],
  },
  selectionOutline: {
    outlineRadiusOffset:      [-20, 20, .1],
    outlineStrokeWidth:       [-20, 20, .1],
    visible: [true],
  },
  hoverMarkers: {
    markerFillOpacity:        [-1,  1,  .001],
    markerSizeMultiplier:     [-20, 20, .1],
    markerStrokeOpacity:      [-1,  1,  .001],
    markerStrokeWidth:        [-20, 20, .1],
    visible: [true],
  },
  hoverOutline: {
    outlineRadiusMultiplier:  [-20, 20, .1],
    outlineRadiusOffset:      [-20, 20, .1],
    outlineStrokeWidth:       [-20, 20, .1],
    visible: [true],
  },
  markers: {
    markerFillOpacity:        [-1,  1,  .001],
    markerOpacity:            [-1,  1,  .001],
    markerSizeMultiplier:     [-20, 20, .1],
    markerStrokeOpacity:      [-1,  1,  .001],
    markerStrokeWidth:        [-20, 20, .1],
    minAbsoluteMarkerSize:    [-20, 20, .1],
    pointHoverRadiusMultiplier: [-20, 20, .1],
    visible: [true],
  },
  portals: {
    labelFontSize:            [-20, 20, .1],
    labelOpacity:             [-1,  1,  .001],
    labelShadowSize:          [-20, 20, .1],
    visible: [true],
  },
}

// Default `topics`
export const MapLayerSources = [
  {
    id: 'covid19@noop.pw',
    label: 'Covid-19 Pandemic',
    src: '/api/resources/bot/covid19@noop.pw',
    icon: 'layout-circle',
  },
  {
    id: 'projects@import.bot',
    label: 'CRI Projects',
    src: '/api/resources/bot/projects@import.bot',
    icon: 'layout-circle',
  },
  {
    id: 'theconversationfr@import.bot',
    label: 'The Conversation',
    src: '/api/resources/feed/theconversation.fr',
    icon: 'layout-circle',
  },
  {
    id: 'everything',
    label: 'Everything',
    src: '/api/resources/',
    icon: 'layout-grid',
    default: true,
  },
]
