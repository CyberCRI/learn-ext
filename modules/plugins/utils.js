const path = require('path')
const webpack_merge = require('webpack-merge')

// Add a helper for resolving absolute directory paths relative to git root.
const abspath = (x) => path.resolve(__dirname, '../..', x)

// Pre-configured webpack-merge instance
const smartMerge = webpack_merge.smartStrategy({ 'module.rules.use': 'prepend' })


module.exports = { abspath, smartMerge }
