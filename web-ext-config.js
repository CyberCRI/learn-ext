// Configuration for web-ext cli.
// References at https://github.com/mozilla/web-ext
const { PackageEnv } = require('./package.config.js')
const _ = require('lodash')

console.log('[!] Using Environment:', PackageEnv.vars)

// Collect the preferences overriden above to the correct format.
// Essentially, these parameters are added in the `about:config` page. The cli
// tool expects them to be in format of `key=value`, hence we apply a map to
// format this object.
const browser_prefs = _({
  'lightweightThemes.selectedThemeID': 'firefox-compact-light@mozilla.org',
  'browser.uidensity': 1,
  'browser.EULA.override': true,
  'devtools.dom.enabled': true,
  'devtools.editor.keymap': 'sublime',
  'devtools.errorconsole.enabled': true,
  'devtools.theme': 'light',
  'devtools.toolbox.splitconsoleHeight': 200,
  'devtools.webconsole.filter.net': true,
  'devtools.webconsole.filter.netxhr': true,
  'devtools.browserconsole.filter.net': true,
  'devtools.browserconsole.filter.netxhr': true,
  'browser.uitour.enabled': false,
}).map((value, key) => `${key}=${value}`)
  .value()


module.exports = {
  sourceDir: './ext',

  run: {
    firefox: PackageEnv.vars.webext_firefox_version,
    browserConsole: true,
    pref: browser_prefs,
    noReload: false,
    startUrl: ['https://en.wikipedia.org/wiki/Solar_System', 'https://en.wikipedia.org'],
  },

  sign: {
    apiKey: PackageEnv.vars.webext_dev_api_key,
    apiSecret: PackageEnv.vars.webext_dev_api_secret,
  },
}
