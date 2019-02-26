// Variables are pulled from environment, see .env.sample for optional and
// required packages.
//
// Environment variables that are prefixed with `ILRN_` are available under
// `config` and are replaced during webpack build.
const webpack = require('webpack')
const _ = require('lodash')
const { abspath } = require('./utils')

const ENV_PREFIX = 'ILRN_'
const FLAGS_PREFIX = 'FLAGS_'

// Predicates for filtering env variables.
const envPredicate = (v, key) => _.startsWith(key, ENV_PREFIX)
const flagPredicate = (v, key) => _.startsWith(key, FLAGS_PREFIX)

// Map function for the chain below, removes the `ENV_PREFIX` and
// transforms `key` to snake_case.
const transformKey = (v, key, o) => {
  return _.chain(key)
    .replace(ENV_PREFIX, '')
    .replace(FLAGS_PREFIX, '')
    .snakeCase()
    .value()
}

// Collect all the package environment variables.
const env_vars = _(process.env)
  .pickBy(envPredicate)
  .mapKeys(transformKey)
  .value()

// Collect all system defined variables.
const sys_env = _(process.env)
  .mapKeys(transformKey)
  .value()

// Collect build specific flags.
const flags = _(process.env)
  .pickBy(flagPredicate)
  .mapKeys(transformKey)
  .value()

// Initialize PackageEnv object with a webpack plugin and vars.
const PackageEnv = {
  webpackPlugin: new webpack.DefinePlugin({
    env: _.mapValues(env_vars, JSON.stringify),
  }),
  vars: env_vars,
  rootDir: abspath('.'),
}

module.exports = { PackageEnv, sys: sys_env, flags }
