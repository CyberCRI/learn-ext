/**
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 * Copyright 2002-@current.year@, Carrot Search s.c.
 */

/**
 * An extension that adds support for switching between light and dark
 * theme of the map.
 */
const ThemeSwitch = function (dotAtlas, options) {
  let theme = "light"

  const lightColorBands = [
    { "end": 0.0003, "color": [ 0x8d, 0xc1, 0xea ], "shading": true, "contours": false },
    { "end": 0.005,  "color": [ 0xa1, 0xd2, 0xf7 ], "shading": true, "contours": false },
    { "end": 0.02,   "color": [ 0xb9, 0xe3, 0xff ], "shading": true, "contours": true  },
    { "end": 0.05,   "color": [ 0xac, 0xd0, 0xa5 ], "shading": false,  "contours": false  },
    { "end": 0.10,   "color": [ 0x94, 0xbf, 0x8b ], "shading": false,  "contours": false  },
    { "end": 0.15,   "color": [ 0xa8, 0xc6, 0x8f ], "shading": false,  "contours": false  },
    { "end": 0.20,   "color": [ 0xbd, 0xcc, 0x96 ], "shading": true,  "contours": false  },
    { "end": 0.30,   "color": [ 0xd1, 0xd7, 0xab ], "shading": true,  "contours": true  },
    { "end": 0.40,   "color": [ 0xef, 0xeb, 0xc0 ], "shading": true,  "contours": false  },
    { "end": 0.50,   "color": [ 0xde, 0xd6, 0xa3 ], "shading": false,  "contours": false  },
    { "end": 0.60,   "color": [ 0xd3, 0xca, 0x9d ], "shading": false,  "contours": false  },
    { "end": 0.70,   "color": [ 0xca, 0xb9, 0x82 ], "shading": false,  "contours": false  },
    { "end": 0.80,   "color": [ 0xc0, 0x9a, 0x53 ], "shading": false,  "contours": false  },
    { "end": 0.85,   "color": [ 0xe0, 0xe0, 0xe0 ], "shading": false,  "contours": false  },
    { "end": 0.90,   "color": [ 0xec, 0xec, 0xec ], "shading": false,  "contours": false  },
    { "end": 1.00,   "color": [ 0xff, 0xff, 0xff ], "shading": false,  "contours": false  }
  ]

  const darkColorBands = [
    { "end": 0.0003, "color": [ 0xcc, 0xcc, 0xcc ], "shading": false, "contours": false },
    { "end": 0.005,  "color": [ 0x11, 0x29, 0x3b ], "shading": false, "contours": false },
    { "end": 0.02,   "color": [ 0x0d, 0x32, 0x4a ], "shading": false, "contours": true },
    { "end": 0.05,   "color": [ 0x2b, 0x51, 0x24 ], "shading": true,  "contours": true },
    { "end": 0.1,    "color": [ 0x30, 0x55, 0x28 ], "shading": true,  "contours": true },
    { "end": 0.15,   "color": [ 0x42, 0x5f, 0x29 ], "shading": true,  "contours": true },
    { "end": 0.16,    "color": [ 0x58, 0x6a, 0x2b ], "shading": true,  "contours": true },
    { "end": 0.18,    "color": [ 0x77, 0x81, 0x34 ], "shading": true,  "contours": true },
    { "end": 0.2,    "color": [ 0xbc, 0xb0, 0x26 ], "shading": true,  "contours": true },
    { "end": 0.3,    "color": [ 0x8b, 0x7e, 0x29 ], "shading": true,  "contours": true },
    { "end": 0.6,    "color": [ 0x76, 0x6a, 0x2d ], "shading": true,  "contours": true },
    { "end": 0.7,    "color": [ 0x5e, 0x50, 0x21 ], "shading": true,  "contours": true },
    { "end": 0.8,    "color": [ 0x4d, 0x42, 0x28 ], "shading": true,  "contours": true },
    { "end": 0.85,   "color": [ 0x79, 0x79, 0x79 ], "shading": true,  "contours": true },
    { "end": 0.9,    "color": [ 0xec, 0xec, 0xec ], "shading": true,  "contours": true },
    { "end": 1,      "color": [ 0xff, 0xff, 0xff ], "shading": true,  "contours": true }
  ]

  const getTheme = () => theme

  const setColorBands = bands => {
    getLayersOfType("elevation").forEach(l => {
      l.set("colorBands", bands)
    })
  }

  const setLabelOptions = options => {
    getLayersOfType("label").forEach(l => {
      l.set(options)
    })
  }

  const getLayersOfType = type => dotAtlas.get("layers").filter(l => l.get("type") === type)

  const setTheme = function (newTheme) {
    theme = newTheme

    switch (newTheme) {
      case "dark":
        setColorBands(darkColorBands)
        setLabelOptions({
          labelColor: [ 255, 255, 255, 255 ],
          labelShadowColor: [ 0, 0, 0, 120 ],
          labelShadowSize: 10
        })
        break

      case "light":
        setColorBands(lightColorBands)
        setLabelOptions({
          labelColor: [ 0, 0, 0, 255 ],
          labelShadowSize: 0
        })
        break

      default:
        throw `Unknown theme ${newTheme}`
    }
  }

  // Contribute extra option to the API and react to setting existing options.
  DotAtlas.injectApiProxy(this, dotAtlas, this, options, {
    options: {
      // Add a new "theme" option.
      theme: { set: setTheme, get: getTheme },

      // Whenever the caller changes the layers option,
      // set current theme colors on the newly provided layers.
      layers: {
        set: (layers) => {
          dotAtlas.set("layers", layers)
          setTheme(getTheme())
        },
        get: () => dotAtlas.get("layers")
      }
    }
  })
}

ThemeSwitch.create = (delegate, options) => {
  // Create the extension.
  const themeSwitch = new ThemeSwitch(delegate, Object.assign({
    // Provide the default value for the new option we contribute.
    theme: getTheme()
  }, options))

  // This is not strictly necessary here, but convenient for the brevity of demos.
  // React to the events emitted by the theme switcher present on all pages,
  // and set the "theme" property on the dotAtlas instance.
  // document.body.addEventListener("theme-change", () => {
  //   themeSwitch.set("theme", getTheme())
  //   themeSwitch.redraw()
  // })

  return themeSwitch

  function getTheme() {
    return document.body.dataset.theme || 'light'
  }
}

export { ThemeSwitch }
