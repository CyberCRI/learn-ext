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
    updateBrowserActionIcon(msg.tabId)
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

const updateBrowserActionIcon = (tabId) => {
  const state = tabState[tabId]

  const icons = {
    active: 'icons/icon-active-128.png',
    idle: 'icons/icon-idle-48.png',
  }

  const iconPath = state.popOutShown ? icons.active : icons.idle

  return browser.browserAction.setIcon({ tabId, path: iconPath })
}


browser.tabs.onUpdated.addListener((id, changeInfo, tab) => {
  if (tabState[id]) {
    // Keeping previous state, replace only the `tab` update status.
    const prevState = tabState[id]
    tabState[id] = { ...prevState, ...tab }
  } else {
    // No old state here -- we'll initialise the new state.
    tabState[id] = { ...tab, popOutShown: false }
  }

  // Take the reference to current tab state.
  // [!] Note that we must not take this reference before the initialisation
  //     step earlier, because the tabState is assigned a _new_ object there
  //     in either cases.
  const state = tabState[id]

  if (changeInfo.status === 'loading') {
    // Either the tab was reloaded or user navigated. We need to make sure
    // that the popOutShown is reset.
    state.popOutShown = false
    // Also notify the tab to close the popOut if not already closed.
    notifyTabAction(id, 'closePopout')
  }

  if (!tab.url.includes('google.')) {
    // Weird, but okay. If its not a google search page, then we show the icon.
    browser.browserAction.enable(tab.id)
  } else {
    browser.browserAction.disable(tab.id)
  }

  updateBrowserActionIcon(id)
})

browser.browserAction.onClicked.addListener((e) => {
  const state = tabState[e.id]
  if (state.popOutShown) {
    state.popOutShown = false
    notifyTabAction(e.id, 'closePopout')
      .then(() => updateBrowserActionIcon(e.id))
  } else {
    state.popOutShown = true
    notifyTabAction(e.id, 'openPopout')
      .then(() => updateBrowserActionIcon(e.id))
  }
})
