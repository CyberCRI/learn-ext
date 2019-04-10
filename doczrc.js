const merge = require('webpack-merge')

const { dotenv, abspath } = require('./tools/node-plugins')


export default {
  title: 'Design Elements | iLearn',
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
      h1: {

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
  port: 8515,

  indexHtml: './docs/docz-assets/index.html',

  codeSandbox: false,
  propsParser: false,

  debug: false,

  modifyBabelRc: (babelrc) => {
    return {...babelrc, plugins: ['react-hot-loader/babel'] }
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
          'react-dom': '@hot-loader/react-dom',
        },
      },
      plugins: [
        dotenv.PackageEnv.webpackPlugin,
      ],
    })
  },
}
