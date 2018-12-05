const webpack = require('webpack')
const WebpackBar = require('webpackbar')
const DashboardPlugin = require('webpack-dashboard/plugin')

const { package_env, abspath } = require('./package.config.js')


module.exports = {
  entry: './src/index.js',
  output: {
    filename: '[name].js',
    path: abspath('dist'),
  },

  resolve: {
    // Alias allows importing modules independent of base paths.
    alias: {
      '~mixins': abspath('src/mixins'),
      '~components': abspath('src/components'),
    }
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
      }
    ]
  },

  plugins: [
    new WebpackBar({ name: 'ilearn', profile: true, basic: false }),
    new DashboardPlugin(),
    new webpack.DefinePlugin({
      env: package_env,
    }),
  ],
}