const merge = require('webpack-merge')

const { dotenv, abspath } = require('./tools/node-plugins')


export default {
  title: 'iLearn UI Components',
  theme: 'docz-theme-default',
  themeConfig: {
    // mode: 'dark',
    codemirrorTheme: 'solarized',
    styles: {
      body: {
        fontFamily: 'Roboto',
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

  debug: false,

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
            use: [
              'style-loader',
              'css-loader',
              {
                loader: 'sass-loader',
                options: { includePaths: [ abspath('./src') ] },
              },
            ],
          },
        ],
      },
      resolve: {
        alias: {
          '~mixins': abspath('src/mixins'),
          '~components': abspath('src/components'),
          '~pages': abspath('src/pages'),
          '~page-commons': abspath('src/pages/_commons'),
        },
      },
      plugins: [
        dotenv.PackageEnv.webpackPlugin,
      ],
    })
  },
}
