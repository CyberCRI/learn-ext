const webpack = require('webpack')
const WebpackBar = require('webpackbar')
const DashboardPlugin = require('webpack-dashboard/plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const { PackageEnv, abspath, transpileLocaleFile } = require('./package.config.js')


// Files that should be copied into the extension directory.
const copySourceBundleRules = [
  { from: './src/manifest.json', to: './' },
  { from: './src/pages', to: './pages' },
  { from: './assets', to: './', ignore: [ 'locales/*', '.DS_Store' ] },
  {
    from: './assets/locales/*.yml',
    to: './_locales/[name]/messages.json',
    toType: 'template',
    transform: transpileLocaleFile,
  },
]


module.exports = {
  entry: {
    app_root: './src/index.js',
    background: './src/procs/background.js',
    // content_scripts: './src/procs/content_scripts.js',
    // page_action: '',
    // browser_action: '',
    // options: '',
  },
  output: {
    filename: '[name].js',
    path: abspath('./ext'),
  },

  resolve: {
    // Alias allows importing modules independent of base paths.
    alias: {
      '~mixins': abspath('src/mixins'),
      '~components': abspath('src/components'),
    },
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.s(c|a)ss$/,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },

  plugins: [
    new WebpackBar({ name: 'ilearn', profile: true, basic: false }),
    new DashboardPlugin(),
    new CopyWebpackPlugin(copySourceBundleRules),
    PackageEnv.webpackPlugin,
  ],
}
