//  Uses lodash and `js-yaml` to transform `yml` blobs to `json` blobs.
//  The resulting blob can be written to locale directory.
const _ = require('lodash')
const yaml = require('js-yaml')


// Flatten Locale object. See assets/locales for details.
const flattenLocaleObject = (target) => {
  // `target` is a nested object of phrases where "leaf nodes" are the actual
  // phrase strings.
  // Given an object with the following structure:
  // { k1: { k2: { k3: 'phrase', k4: 'phrase' }, k5: 'phrase' } }
  //
  // the output object is:
  // { k1_k2_k3: 'phrase', k1_k2_k4: 'phrase', k1_k5: 'phrase' }
  let output = {}
  const step = (object, prev) => {
    Object.keys(object).forEach((key) => {
      let value = object[key]
      let newKey = prev
        ? prev + '_' + key
        : key
      if (_.isObject(value)) {
        return step(value, newKey)
      }
      output[newKey] = { message: value }
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
