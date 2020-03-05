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
    lightAltitude:    3.2,
    lightAzimuth:     4.5,
    lightIntensity:   .3,
    lightness:        -0.02,
    maxRadiusDivider: 22,
    saturation:       0.06,
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
    markerSizeMultiplier: 10,
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
    markerFillOpacity:    0.15,
    markerOpacity:        0.7,
    markerSizeMultiplier: 2,
    markerStrokeOpacity:  0,
    markerStrokeWidth:    0,
    minAbsoluteMarkerSize: 0,
    pointHoverRadiusMultiplier: 10,
    visible: true,
  },
  labels: {
    labelColor:         rgba`#000000ff`,
    labelFontFamily:    'Barlow',
    labelFontSize:      15,
    labelFontVariant:   'normal',
    labelFontWeight:    400,
    labelOpacity:       1,
    labelShadowColor:   rgba`#ffffff99`,
    labelShadowSize:    10,
    visible: true,
  },
}

