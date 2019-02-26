import { RuntimeHook, RuntimeEvents } from './runtime-hooks'

const tabState = {}

const messageConsumer = (msg) => {
  if (msg.action == 'openCartography') {
    const url = browser.runtime.getURL('pages/options.html')
    browser.tabs.create({ url }).then(console.log, console.error)
  }
  if (msg.action == 'openSettings') {
    browser.runtime.openOptionsPage()
  }
  if (msg.action == 'closePopout') {
    tabState[msg.tabId].popOutShown = false
    updatePageActionIcon(msg.tabId)
    notifyTabAction(msg.tabId, 'closePopout')
  }

  console.info(`Consuming action=<${msg.action}>`, msg)
}

const reactOnInstalled = ({ reason, temporary }) => {
  if (reason == 'install') {
    const url = browser.runtime.getURL('pages/onboarding.html')
    browser.tabs.create({ url }).then(console.log, console.error)

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

const updatePageActionIcon = (tabId) => {
  const state = tabState[tabId]

  const icons = {
    active: 'icons/icon-active-128.png',
    idle: 'icons/icon-idle-48.png',
  }

  const iconPath = state.popOutShown ? icons.active : icons.idle

  return browser.pageAction.setIcon({ tabId, path: iconPath })
}


browser.tabs.onUpdated.addListener((id, changeInfo, tab) => {
  if (!tab.url.includes('google.')) {
    // Weird, but okay. If its not a google search page, then we show the icon.
    browser.pageAction.show(tab.id)
  } else {
    browser.pageAction.hide(tab.id)
  }

  updatePageActionIcon(id)
})

browser.pageAction.onClicked.addListener((e) => {
  const state = tabState[e.id]
  if (state.popOutShown) {
    state.popOutShown = false
    notifyTabAction(e.id, 'closePopout')
      .then(() => updatePageActionIcon(e.id))
  } else {
    state.popOutShown = true
    notifyTabAction(e.id, 'openPopout')
      .then(() => updatePageActionIcon(e.id))
  }
})
