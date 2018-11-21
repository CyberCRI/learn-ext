const path = require('path')
const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const WebpackBar = require('webpackbar')
const DashboardPlugin = require('webpack-dashboard/plugin')


module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'development',

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
    new webpack.HotModuleReplacementPlugin(),
    new UglifyJsPlugin({ cache: true, parallel: 4, sourceMap: true }),
  ],

  optimization: {
    // splitChunks: {
    //   chunks: 'all',
    // },
    usedExports: true,
  },

  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
    hot: true,
  },
}