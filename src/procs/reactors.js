// Handlers for handling actions requested.
import { browser } from './stubs'

const urlProvider = {
  web: (path) => `${env.webroot_url}/${path}`,
  extension: (path) => browser.runtime.getURL(path),
}

const pathReactor = (path, provider=urlProvider.extension) => {
  const url = provider(path)
  const open = () => {
    return browser.tabs.create({ url })
  }
  return { url, open }
}

export const ExtensionPages = {
  dashboard: pathReactor('pages/dashboard.html', urlProvider.web),
  discover: pathReactor('pages/discover.html', urlProvider.web),
  settings: pathReactor('pages/extension-auth.html'),
  onboarding: pathReactor('pages/onboarding.html', urlProvider.web),
  changelog: pathReactor('pages/changelog.html', urlProvider.web),
}
