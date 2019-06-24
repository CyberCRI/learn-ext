import { ExtensionPages } from './reactors'
import { i18n } from './wrappers'

const attachActionMenu = () => {
  // Attach a menu button for shortcuts to the dashboard page.
  browser.contextMenus.create({
    contexts: ['browser_action'],
    title: i18n('menu.action.openDashboard'),
    onclick: ExtensionPages.dashboard.open,
  })
}

const attachPageMenu = () => {
  browser.contextMenus.create({
    contexts: ['all'],
    command: '_execute_browser_action',
    title: i18n('menu.action.addResource'),
    documentUrlPatterns: ['http://*/*', 'https://*/*'],
  })
}

export const initContextMenus = () => {
  // Setup all the context menus here.
  attachActionMenu()
  attachPageMenu()
}
