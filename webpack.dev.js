const webpack = require('webpack')

const base_config = require('./webpack.common')
const { smartMerge } = require('./tools/node-plugins')


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

  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './ext',
    port: 8517,
    hot: true,
    hotOnly: true,
    // noInfo: false,
    stats: 'minimal',
    inline: true,
    watchContentBase: true,
    open: false,
    overlay: true,
    writeToDisk: false,
  },
})
