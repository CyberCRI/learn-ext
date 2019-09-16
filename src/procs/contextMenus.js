import { browser } from '~procs/stubs'
import { ExtensionPages } from './reactors'
import { i18n } from './wrappers'

const attachActionMenu = () => {
  // Attach a menu button for shortcuts to the dashboard page.
  browser.contextMenus.create({
    contexts: ['browser_action'],
    title: i18n('menu.action.openDashboard'),
    onclick: ExtensionPages.dashboard.open,
  })

  browser.contextMenus.create({
    contexts: ['browser_action'],
    title: i18n('menu.action.openMap'),
    onclick: ExtensionPages.discover.open,
  })
}

const attachPageMenu = (handler) => {
  browser.contextMenus.create({
    contexts: ['page'],
    title: i18n('menu.action.addResource'),
    documentUrlPatterns: ['http://*/*', 'https://*/*'],
    onclick: handler,
  })
}

export const initContextMenus = (handlers) => {
  // Setup all the context menus here.
  attachActionMenu()
  attachPageMenu(handlers.pageMenu)
}
