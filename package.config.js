// Utilities that are explicitly used for js build configuration.
// Variables are pulled from environment, see .env.sample for optional and
// required packages.
//
// Environment variables that are prefixed with `ILRN_` are available under
// `config` and are replaced during webpack build.
const webpack = require('webpack')
const _ = require('lodash')
const path = require('path')
const yaml = require('js-yaml')
const webpack_merge = require('webpack-merge')


const ENV_PREFIX = 'ILRN_'

// Add a helper for resolving absolute directory paths relative to git root.
const abspath = (x) => path.resolve(__dirname, x)


// Flatten Locale object. See assets/locales for details.
const flattenLocaleObject = (target) => {
  let output = {}
  const step = (object, prev) => {
    Object.keys(object).forEach((key) => {
      let value = object[key]
      let newKey = prev
        ? prev + '_' + key
        : key
      if (!_.has(value, 'message')) {
        return step(value, newKey)
      }
      output[newKey] = value
    })
  }
  step(target)

  return output
}

// Transform a Locale file buffer to JSON string
const transpileLocaleFile = (buffer) => {
  return _(buffer)
    .thru((b) => b.toString('utf-8'))
    .thru(yaml.safeLoad)
    .thru(flattenLocaleObject)
    .thru(JSON.stringify)
    .value()
}

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

// Pre-configured webpack-merge instance
const smartMerge = webpack_merge.smartStrategy({ 'module.rules.use': 'prepend' })

module.exports = { PackageEnv, abspath, transpileLocaleFile, smartMerge }
