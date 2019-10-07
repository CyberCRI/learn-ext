import { browser } from '~procs/stubs'
import { ExtensionPages } from './reactors'
import _ from 'lodash'


const i18nT = (key) => {
  // Tiny helper for resolving locale phrases from webext.i18n API.
  return browser.i18n.getMessage(key.replace(/\./g, '_'))
}


const attachActionMenu = () => {
  // Attach a menu button for shortcuts to the dashboard page.
  browser.contextMenus.create({
    contexts: ['browser_action'],
    title: i18nT('menu.action.openDashboard'),
    onclick: ExtensionPages.dashboard.open,
  })

  browser.contextMenus.create({
    contexts: ['browser_action'],
    title: i18nT('menu.action.openMap'),
    onclick: ExtensionPages.discover.open,
  })
}

const attachPageMenu = (handler) => {
  browser.contextMenus.create({
    contexts: ['page'],
    title: i18nT('menu.action.addResource'),
    documentUrlPatterns: ['http://*/*', 'https://*/*'],
    onclick: handler,
  })
}

export const initContextMenus = (handlers) => {
  // Setup all the context menus here.
  attachActionMenu()
  attachPageMenu(handlers.pageMenu)
}
