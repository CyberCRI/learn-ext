import { RuntimeHook, RuntimeEvents } from './runtime-hooks'
import { ExtensionPages } from './reactors'
import _ from 'lodash'

const tabState = {}
const ports = {}

const messageConsumer = (msg) => {
  if (msg.action == 'openCartography') {
    ExtensionPages.dashboard.open()
  }
  if (msg.action == 'openSettings') {
    ExtensionPages.settings.open()
  }
  if (msg.action == 'setIcon') {

  }
  console.info(`Consuming action=<${msg.action}>`, msg)
}

const reactOnInstalled = ({ reason, temporary }) => {
  if (reason == 'install') {
    ExtensionPages.onboarding.open()

    browser.storage.local
      .set({
        user: {
          username: 'nugget@noop.pw',
          signedIn: false,
        },
      })
  }
}

new RuntimeHook(RuntimeEvents.onMessage, messageConsumer).attach()
new RuntimeHook(RuntimeEvents.onInstall, reactOnInstalled).attach()

const notifyTabAction = (tabId, action) => {
  const state = tabState[tabId]
  return browser.tabs.sendMessage(tabId, { tabId, action, state })
}

const updateBrowserActionIcon = (tabId) => {
  const state = tabState[tabId]

  const icons = {
    active: 'icons/icon-active-128.png',
    idle: 'icons/icon-idle-48.png',
  }

  const iconPath = state.popOutShown ? icons.active : icons.idle

  return browser.browserAction.setIcon({ tabId, path: iconPath })
}


browser.browserAction.onClicked.addListener((e) => {
  const tabId = e.id
  const tabInfo = { title: e.title, url: e.url, favicon: e.favIconUrl }

  } else {

  }
})
