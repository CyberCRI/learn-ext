// Configuration for Production builds.
const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const base_config = require('./webpack.common')
const { smartMerge } = require('./tools/node-plugins')


module.exports = smartMerge(base_config, {
  mode: 'production',

  plugins: [
    // Remove contents of build directory
    new CleanWebpackPlugin([ 'ext' ]),
    new MiniCssExtractPlugin({ filename: '[name].css' }),
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
        ],
      },
      {
        test: /\.s(c|a)ss$/,
        exclude: /node_modules/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
        ],
      },
    ],
  },
})
