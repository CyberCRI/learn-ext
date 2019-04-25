import { RuntimeHook, RuntimeEvents } from './runtime-hooks'
import { ExtensionPages } from './reactors'
import { userId } from '~mixins/utils'
import _ from 'lodash'

const tabState = {}
const ports = {}

const dispatchReaction = (msg) => {
  if (msg.action == 'dashboard') {
    ExtensionPages.dashboard.open()
  }
  if (msg.action == 'settings') {
    ExtensionPages.settings.open()
  }
  console.info(`Consuming action=<${msg.action}>`, msg)
}

const reactOnInstalled = ({ reason, temporary }) => {
  if (reason == 'install') {
    ExtensionPages.onboarding.open()

    browser.storage.local
      .set({
        user: {
          uid: userId('nugget@noop.pw'),
          username: 'nugget@noop.pw',
          signedIn: false,
        },
      })
  }
}

new RuntimeHook(RuntimeEvents.onInstall, reactOnInstalled).attach()

browser.runtime.onConnect.addListener((port) => {
  const name = port.name
  const tabId = port.sender.tab.id

  if (!ports[tabId]) {
    ports[tabId] = {}
  }

  ports[tabId][name] = port

  console.log(`Connected to Port< tab=${tabId} name=${name} >`)
  port.onMessage.addListener((m) => {
    console.log(`Message from Port< tab=${tabId} name=${name} >: `, m)
    if (m.context === 'tabState') {
      tabState[tabId] = m.payload
      updateBrowserActionIcon(tabId)
    } else if (m.context === 'reactor') {
      dispatchReaction(m.payload)
    } else if (m.context === 'broadcast') {
      _.forOwn(ports[tabId], (p) => {
        p.postMessage(m.payload)
      })
    }
  })
})

const updateBrowserActionIcon = (tabId) => {
  const state = tabState[tabId]

  const icons = {
    active: 'icons/icon-active-128.png',
    idle: 'icons/icon-idle-48.png',
  }

  const iconPath = state.active ? icons.active : icons.idle

  return browser.browserAction.setIcon({ tabId, path: iconPath })
}


browser.browserAction.onClicked.addListener((e) => {
  const tabId = e.id
  const tabInfo = { title: e.title, url: e.url, favicon: e.favIconUrl }

  if (!tabState[tabId]) {
    console.warn(`No Port attached to tab=${tabId}`)
  } else {
    const { active } = tabState[tabId]
    const action = active ? 'close' : 'open'

    _.forOwn(ports[tabId], (port) => {
      port.postMessage({
        action,
        tabInfo,
      })
    })
  }
})
