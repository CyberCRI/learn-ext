const merge = require('webpack-merge')

const { PackageEnv, abspath } = require('./package.config.js')


export default {
  title: 'iLearn UI Components',
  theme: 'docz-theme-default',
  themeConfig: {
    // mode: 'dark',
    codemirrorTheme: 'solarized',
    styles: {
      body: {
        fontFamily: 'IBM Plex Mono',
        fontSize: 12,
      },
      code: {
        fontFamily: 'Fira Code',
      },
    },
  },

  htmlContext: {
    head: {
      links: [],
    },
  },

  src: './src',
  public: './ext',

  indexHtml: './docs/docz-assets/index.html',

  codeSandbox: false,

  debug: true,

  modifyBabelRc: (babelrc) => {
    return {...babelrc, plugins: [] }
  },
  modifyBundlerConfig: (config, dev, args) => {
    return merge(config, {
      module: {
        rules: [
          {
            test: /\.css$/,
            use: ['style-loader', 'css-loader'],
          },
          {
            test: /\.s(c|a)ss$/,
            exclude: /node_modules/,
            use: ['style-loader', 'css-loader', 'sass-loader'],
          },
        ],
      },
      resolve: {
        alias: {
          '~mixins': abspath('src/mixins'),
          '~components': abspath('src/components'),
        },
      },
      plugins: [
        PackageEnv.webpackPlugin,
      ],
    })
  },
}
