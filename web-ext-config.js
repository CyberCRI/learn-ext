// Configuration for web-ext cli.
// References at https://github.com/mozilla/web-ext
const { dotenv } = require('./tools/node-plugins')
const _ = require('lodash')

console.log('[!] Using Environment:', dotenv.PackageEnv.vars)


// Additional Preferences
const browser_prefs_extra = {
  'security.csp.enable': false,
  'security.mixed_content.block_active_content': false,
}

// Collect the preferences overriden above to the correct format.
// Essentially, these parameters are added in the `about:config` page. The cli
// tool expects them to be in format of `key=value`, hence we apply a map to
// format this object.
const browser_prefs = _({
  'intl.locale.requested': 'fr',
  'intl.locale.matchOS': false,
  'general.useragent.locale': 'fr',
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
