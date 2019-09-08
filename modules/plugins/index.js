// Utilities that are explicitly used for js build configuration.
// Here, we just export the utilities available for us.
const { abspath, smartMerge } = require('./utils')
const locale = require('./locale')
const dotenv = require('./dotenv')
const manifest = require('./manifest')

module.exports = { locale, dotenv, abspath, manifest, smartMerge }
