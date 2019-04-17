import { RuntimeHook, RuntimeEvents } from './runtime-hooks'
import { ExtensionPages } from './reactors'
import _ from 'lodash'

const tabState = {}
const activeState = {}
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
    } else if (m.context === 'reactor') {
      messageConsumer(m.payload)
    } else if (m.context === 'broadcast') {
      _.forOwn(ports[tabId], (p) => {
        p.postMessage(m.payload)
      })
    }
  })
})


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

  const iconPath = state ? icons.active : icons.idle

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
