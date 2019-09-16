// Handlers for handling actions requested.
import { browser } from '~procs/stubs'


const pathReactor = (path) => {
  const url = browser.runtime.getURL(path)
  const open = () => {
    return browser.tabs.create({ url })
  }
  return { url, open }
}

export const ExtensionPages = {
  dashboard: pathReactor('pages/dashboard.html'),
  discover: pathReactor('pages/options.html'),
  settings: pathReactor('pages/settings.html'),
  onboarding: pathReactor('pages/onboarding.html'),
  changelog: pathReactor('pages/changelog.html'),
}
