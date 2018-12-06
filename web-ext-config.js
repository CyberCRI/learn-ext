const { PackageEnv, abspath } = require('./package.config.js')

console.log(PackageEnv.vars)

module.exports = {
  sourceDir: './ext',

  run: {
    firefox: PackageEnv.vars.webext_firefox_version,
    browserConsole: true,

    pref: {
      // 'browserUidensity': 1,
    },

    // firefoxProfile: PackageEnv.vars.webext_profile_namespace,
    startUrl: ['about:debugging', 'https://en.wikipedia.org'],
  },

  sign: {
    apiKey: PackageEnv.vars.webext_dev_api_key,
    apiSecret: PackageEnv.vars.webext_dev_api_secret,
  },
}
