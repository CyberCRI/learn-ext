const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const base_config = require('./webpack.common')
const { smartMerge } = require('./modules/plugins')


module.exports = smartMerge(base_config, {
  mode: 'development',
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new MiniCssExtractPlugin(),
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: [ {
          loader: MiniCssExtractPlugin.loader,
          options: { hmr: true },
        } ],
      },
      {
        test: /\.s(c|a)ss$/,
        exclude: /node_modules/,
        use: [ {
          loader: MiniCssExtractPlugin.loader,
          options: { hmr: true },
        } ],
      },
    ],
  },

  devtool: 'cheap-module-eval-source-map',
  devServer: {
    port: 8517,
    hot: true,
    hotOnly: true,
    clientLogLevel: 'error',
    public: 'localhost:8517',
    useLocalIp: true,
    // noInfo: false,
    stats: 'minimal',
    inline: true,
    watchContentBase: true,
    open: false,
    overlay: true,
    writeToDisk: false,
  },
})
