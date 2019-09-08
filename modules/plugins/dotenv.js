// Variables are pulled from environment, see .env.sample for optional and
// required packages.
//
// [!] I M P O R T A N T
//
// Enviroment Variables are exposed with objects grouped by consumer.
// Specifically, `moduleVars` are critical since these are available in the JS
// packages. Hence, care must be taken to not unintentionally expose ANY other
// variables in environment, since they might include credentials or sensitive
// data.
//
// sys, flags, and build objects are used in webpack and tooling, and do not
// get bundled.
//
// @exports.sys: All env variables in `process.env`.
// @exports.flags: Variables with `FLAGS_` prefix.
// @exports.PackageEnv: Webpack env plugin and bundled variables.

const webpack = require('webpack')
const _ = require('lodash')
const { abspath } = require('./utils')

const collectEnv = ({ prefix='', transform=true }) => {
  const transformKey = (value, key, object) => {
    // When `transform` is enabled, the env object key prefixes are stripped off
    // and converted to `snakeCase`.
    if (!transform) {
      return key
    }
    return _.chain(key)
      .replace(prefix, '')
      .snakeCase()
      .value()
  }
  return _(process.env)
    .pickBy((v, key) => _.startsWith(key, prefix))
    .mapKeys(transformKey)
    .value()
}

// Collect all the package environment variables.
const moduleVars = collectEnv({ prefix: 'ILRN_' })

// Initialize PackageEnv object with a webpack plugin and vars.
const PackageEnv = {
  webpackPlugin: new webpack.DefinePlugin({
    env: _.mapValues(moduleVars, JSON.stringify),
  }),
  vars: moduleVars,
  rootDir: abspath('.'),
}

module.exports = {
  PackageEnv,
  sys: collectEnv({ transform: false }),
  flags: collectEnv({ prefix: 'FLAGS_'}),
  build: collectEnv({ prefix: 'BUILD_' }),
}
