// Configuration for web-ext cli.
// References at https://github.com/mozilla/web-ext
const { dotenv } = require('./tools/node-plugins')
const _ = require('lodash')

if (dotenv.flags.verbose == 'yes') {
  console.log('[!] Using Environment:', dotenv.PackageEnv.vars)
}

const prefs = {
  'browser.EULA.override': true,
  'browser.uidensity': 1,
  'browser.uitour.enabled': false,
  'devtools.browserconsole.filter.net': true,
  'devtools.browserconsole.filter.netxhr': true,
  'devtools.dom.enabled': true,
  'devtools.editor.keymap': 'sublime',
  'devtools.errorconsole.enabled': true,
  'devtools.theme': 'light',
  'devtools.toolbox.splitconsoleHeight': 200,
  'devtools.webconsole.filter.net': true,
  'devtools.webconsole.filter.netxhr': true,
  'general.useragent.locale': 'fr',
  'intl.locale.matchOS': false,
  'intl.locale.requested': 'fr',
  'lightweightThemes.selectedThemeID': 'firefox-compact-light@mozilla.org',
}

// Optional Preferences overrides
let prefs_extra = {}

if (dotenv.flags.no_csp == 'yes') {
  prefs_extra = {
    'security.csp.enable': false,
    'security.mixed_content.block_active_content': false,
  }
}

// Collect the preferences overriden above to the correct format.
// Essentially, these parameters are added in the `about:config` page. The cli
// tool expects them to be in format of `key=value`, hence we apply a map to
// format this object.
const browser_prefs = _({ ...prefs, ...prefs_extra })
  .map((value, key) => `${key}=${value}`)
  .value()


module.exports = {
  sourceDir: './ext',
  ignoreFiles: [
    'report.html',
  ],

  run: {
    firefox: dotenv.PackageEnv.vars.webext_firefox_version,
    browserConsole: false,
    keepProfileChanges: false,
    firefoxProfile: 'web-ext-dev',
    pref: browser_prefs,
    noReload: false,
    startUrl: [
      'https://en.wikipedia.org/wiki/Special:Random',
      'https://en.wikipedia.org/wiki/Special:Random',
    ],
  },

  build: {
    overwriteDest: true,
  },
}
