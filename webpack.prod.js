// Configuration for Production builds.
const merge = require('webpack-merge')
const base_config = require('./webpack.common')


module.exports = merge(base_config, {
  mode: 'production',

  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
})
