const webpack = require('webpack')

const base_config = require('./webpack.common')
const { smartMerge } = require('./package.config.js')


module.exports = smartMerge(base_config, {
  mode: 'development',
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: [ 'style-loader' ],
      },
      {
        test: /\.s(c|a)ss$/,
        exclude: /node_modules/,
        use: [ 'style-loader' ],
      },
    ],
  },

  devtool: 'inline-source-map',
  devServer: {
    contentBase: './ext',
    hot: false,
    noInfo: false,
    stats: 'minimal',
    open: false,
    inline: true,
    watchContentBase: true,
  },
})
