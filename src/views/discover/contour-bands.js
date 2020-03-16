/* eslint no-multi-spaces: 0 */
import { rgba } from './utils'

// Color Bands.
// I use sketch to generate this list, but it's not required to automate this.
// There are two bands, dark and light.
//
// The scale values were taken from `Carrot Search` Cookbook for dotAtlas.
//
// All palettes are inlined between ->><<-.

// palettes ->>
export const Dark = [
  { end: 0.0003, color: rgba`#182025`, shading: true, contours: false },
  { end: 0.005,  color: rgba`#11293b`, shading: true, contours: false },
  { end: 0.02,   color: rgba`#0d324a`, shading: true, contours: true  },
  { end: 0.05,   color: rgba`#2b5124`, shading: true, contours: true  },
  { end: 0.1,    color: rgba`#305528`, shading: true, contours: true  },
  { end: 0.15,   color: rgba`#425f29`, shading: true, contours: true  },
  { end: 0.16,   color: rgba`#586a2b`, shading: true, contours: true  },
  { end: 0.18,   color: rgba`#778134`, shading: true, contours: true  },
  { end: 0.2,    color: rgba`#bcb026`, shading: true, contours: true  },
  { end: 0.3,    color: rgba`#8b7e29`, shading: true, contours: true  },
  { end: 0.6,    color: rgba`#766a2d`, shading: true, contours: true  },
  { end: 0.7,    color: rgba`#5e5021`, shading: true, contours: true  },
  { end: 0.8,    color: rgba`#4d4228`, shading: true, contours: true  },
  { end: 0.85,   color: rgba`#797979`, shading: true, contours: true  },
  { end: 0.9,    color: rgba`#ececec`, shading: true, contours: true  },
  { end: 1,      color: rgba`#ffffff`, shading: true, contours: true  },
]

export const Light = [
  { end: 0.0003, color: rgba`#8dc1ea`, shading: true,  contours: false },
  { end: 0.005,  color: rgba`#a1d2f7`, shading: true,  contours: false },
  { end: 0.02,   color: rgba`#b9e3ff`, shading: true,  contours: true  },
  { end: 0.05,   color: rgba`#acd0a5`, shading: true,  contours: true  },
  { end: 0.10,   color: rgba`#94bf8b`, shading: true,  contours: true  },
  { end: 0.15,   color: rgba`#a8c68f`, shading: true,  contours: true  },
  { end: 0.20,   color: rgba`#bdcc96`, shading: true,  contours: true  },
  { end: 0.30,   color: rgba`#d1d7ab`, shading: true,  contours: true  },
  { end: 0.40,   color: rgba`#efebc0`, shading: true,  contours: true  },
  { end: 0.50,   color: rgba`#ded6a3`, shading: true,  contours: true  },
  { end: 0.60,   color: rgba`#d3ca9d`, shading: true,  contours: true  },
  { end: 0.70,   color: rgba`#cab982`, shading: true,  contours: true  },
  { end: 0.80,   color: rgba`#c09a53`, shading: true,  contours: true  },
  { end: 0.85,   color: rgba`#e0e0e0`, shading: true,  contours: true  },
  { end: 0.90,   color: rgba`#ececec`, shading: true,  contours: true  },
  { end: 1.00,   color: rgba`#ffffff`, shading: true,  contours: true  },
]
// <<-

// Export the default, but this can be changed.
export const ContourPalette = Light
