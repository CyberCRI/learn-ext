const path = require('path')
const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const WebpackBar = require('webpackbar')
const DashboardPlugin = require('webpack-dashboard/plugin')

const { package_env } = require('./package.config.js')


// Add a helper for resolving absolute directory paths relative to git root.
const abspath = (x) => path.resolve(__dirname, x)


module.exports = {
  entry: './src/index.js',
  output: {
    filename: '[name].js',
    path: abspath('dist'),
  },
  mode: 'development',

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
    new webpack.HotModuleReplacementPlugin(),
    // new UglifyJsPlugin({ cache: true, parallel: 4, sourceMap: true }),
    // new webpack.DefinePlugin({
    //   'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    //   'process.env.DEBUG': JSON.stringify(process.env.DEBUG)
    // }),
    new webpack.DefinePlugin({
      env: package_env,
    }),
  ],

  optimization: {
    // splitChunks: {
    //   chunks: 'all',
    // },
    // usedExports: true,
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\\/]node_modules[\\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    },
  },


  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
    hot: true,
    noInfo: false,
    stats: 'minimal',
  },
}