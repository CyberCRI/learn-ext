const webpack = require('webpack')
const merge = require('webpack-merge')

const base_config = require('./webpack.common')


module.exports = merge(base_config, {
  mode: 'development',
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],

  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
    hot: true,
    noInfo: false,
    stats: 'minimal',
  },
})
