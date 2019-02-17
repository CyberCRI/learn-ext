//  Uses lodash and `js-yaml` to transform `yml` blobs to `json` blobs.
//  The resulting blob can be written to locale directory.
const _ = require('lodash')
const yaml = require('js-yaml')


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
const transpile = (buffer) => {
  return _(buffer)
    .thru((b) => b.toString('utf-8'))
    .thru(yaml.safeLoad)
    .thru(flattenLocaleObject)
    .thru(JSON.stringify)
    .value()
}

module.exports = { transpile }
