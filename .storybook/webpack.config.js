const baseConfig = require('../webpack.dev.js')
const { dotenv } = require('../tools/node-plugins')

module.exports = async ({ config, mode }) => {
  return {
    ...config,
    resolve: baseConfig.resolve,
    module: {
      ...config.module,
      rules: baseConfig.module.rules,
    },
    plugins: [
      ...config.plugins,
      dotenv.PackageEnv.webpackPlugin,
    ],
  }
}