import { RuntimeHook, RuntimeEvents } from './runtime-hooks'

const messageConsumer = (msg) => {
  if (msg.action == 'showOptions') {
    browser.runtime.openOptionsPage()
  }

  if (msg.action == 'closePopout') {
    browser.tabs.sendMessage(msg.tabId, { tabId: msg.tabId, activate: true, action: 'closePopout', pose: 'close' })
  }

  console.info('Message!', msg)
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


browser.tabs.onUpdated.addListener((id, changeInfo, tab) => {
  console.log(tab, changeInfo)
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
