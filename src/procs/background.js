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
    browser.pageAction
      .show(tab.id)
      .then(() => {
        browser.pageAction.setIcon({ tabId: tab.id, path: 'icons/icon-idle-48.png' })
      })
  } else {
    browser.pageAction.hide(tab.id)
  }

  browser.pageAction.setTitle({ tabId: tab.id, title: browser.i18n.getMessage('actions_page_title') })
})

browser.pageAction.onClicked.addListener((e) => {
  browser.pageAction
    .setIcon({ tabId: e.id, path: 'icons/icon-active-128.png' })

  browser.tabs.sendMessage(e.id, { tabId: e.id, action: 'togglePopout' })
})
