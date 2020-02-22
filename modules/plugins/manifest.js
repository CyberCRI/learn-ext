// Uses information from git commit hash, build settings, to rewrite the
// manifest from the base template.
const _ = require('lodash')
const subproc = require('child_process')

const IS_PRODUCTION = process.env.NODE_ENV === 'production'

// Obtain latest git revision for this version
const gitRevision = subproc
  .execSync('git rev-parse --short HEAD')
  .toString()
  .trim()


const applyTransformations = (mbase) => {
  const targetMode = IS_PRODUCTION ? 'prod' : 'dev'
  let overrides = {
    version_name: `${mbase.version}${targetMode}${gitRevision}`,
  }
  return _.merge(_.cloneDeep(mbase), overrides)
}

const transform = (buffer) => (
  _(buffer)
    .thru((b) => b.toString('utf-8'))
    .thru(JSON.parse)
    .thru(applyTransformations)
    .thru(JSON.stringify)
    .value()
)

module.exports = { transform }
