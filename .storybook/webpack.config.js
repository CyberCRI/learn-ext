// Storybook webpack configuration (aka, be nice to each other!)
//
// We have a few specific resolve configurations in base webpack config. To
// configure storybook's webpack config, we use the `webpack.dev` directives
// and merge them with storybook configuration.
//
// Specifically, we merge the webpack.resolve, and webpack.module.rules fields.
// Additionally, the web-extension-polyfill is replaced with a no-op, and we
// have created an instance of MiniCssExtractPlugin. Note that here we've
// avoided merging webpack.plugins directive -- this is intentional! This avoids
// conflicting plugin instances.
//
// [@prashnts]
//
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const baseConfig = require('../webpack.common.js')
const { dotenv, abspath } = require('../modules/plugins')

// Replace browser-polyfill with empty module.
const nullifyWebExtPolyfillRule = {
  test: abspath('node_modules/webextension-polyfill/dist/browser-polyfill.js'),
  use: 'null-loader',
}

module.exports = async ({ config, mode }) => {
  return {
    ...config,
    resolve: baseConfig.resolve,
    module: {
      ...config.module,
      rules: [...baseConfig.module.rules, nullifyWebExtPolyfillRule ],
    },
    plugins: [
      ...config.plugins,
      dotenv.PackageEnv.webpackPlugin,
      new MiniCssExtractPlugin(),
    ],
  }
}
