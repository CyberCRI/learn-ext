// Uses information from git commit hash, build settings, to rewrite the
// manifest from the base template.
const _ = require('lodash')
const subproc = require('child_process')
const { buildTarget } = require('./utils')

// Obtain latest git revision for this version
const gitRevision = subproc
  .execSync('git rev-parse --short HEAD')
  .toString()
  .trim()


const applyTransformations = (mbase) => {
  const targetMode = buildTarget.isProduction ? 'prod' : 'dev'
  let overrides = {
    version_name: `${mbase.version}${targetMode}${gitRevision}`,
  }
  if (buildTarget.isProduction) {
    overrides.content_scripts = [
      { css: [ 'css/app_root.css' ] },
    ]
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
