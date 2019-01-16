const webpack = require('webpack')
const merge = require('webpack-merge')

const base_config = require('./webpack.common')

const merge_conf = {
  'module.rules.use': 'prepend',
}

module.exports = merge.smartStrategy(merge_conf)(base_config, {
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
    contentBase: './dist',
    hot: true,
    noInfo: false,
    stats: 'minimal',
  },
})
