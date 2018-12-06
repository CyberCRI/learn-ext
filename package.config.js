// Utilities that are explicitly used for js build configuration.
// Variables are pulled from environment, see .env.sample for optional and
// required packages.
//
// Environment variables that are prefixed with `ILRN_` are available under
// `config` and are replaced during webpack build.
const webpack = require('webpack')
const _ = require('lodash')
const path = require('path')


const ENV_PREFIX = 'ILRN_'

// Add a helper for resolving absolute directory paths relative to git root.
const abspath = (x) => path.resolve(__dirname, x)

// Predicate for filtering env variables.
const envPredicate = (v, key) => _.startsWith(key, ENV_PREFIX)

// Map function for the chain below, removes the `ENV_PREFIX` and
// transforms `key` to snake_case.
const transformKey = (v, key, o) => {
  return _.chain(key)
    .replace(ENV_PREFIX, '')
    .snakeCase()
    .value()
}

// Collect all the package environment variables.
const env_vars = _(process.env)
  .pickBy(envPredicate)
  .mapKeys(transformKey)
  .value()

// Print env variables, skipping anything that might be an API key.
const printVariables = () => {
  // TODO!
}

const PackageEnv = {
  webpackPlugin: new webpack.DefinePlugin({
    env: _.mapValues(env_vars, JSON.stringify),
  }),
  vars: env_vars,
  rootDir: abspath('.'),
}

module.exports = { PackageEnv, abspath }
