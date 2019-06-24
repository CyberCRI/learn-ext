// Configuration for Production builds.
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const base_config = require('./webpack.common')
const { smartMerge } = require('./tools/node-plugins')


module.exports = smartMerge(base_config, {
  mode: 'production',

  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        terserOptions: {
          keep_classnames: true,
          drop_console: true,
        },
      }),
    ],
  },

  plugins: [
    // Remove contents of build directory
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({ filename: 'css/[name].css' }),
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
  stats: {
    assets: true,
  },
})
