import { RuntimeHook, RuntimeEvents } from './runtime-hooks'

const messageConsumer = (msg) => {
  if (msg.action == 'showOptions') {
    browser.runtime.openOptionsPage()
  }
}

const messageHook = new RuntimeHook(RuntimeEvents.onMessage, messageConsumer).attach()

browser.runtime.onInstalled.addListener(({ reason, temporary }) => {
  if (reason == 'install') {
    const url = browser.runtime.getURL('pages/onboarding.html')
    browser.tabs.create({ url }).then(console.log, console.error)
  }
})

browser.tabs.onUpdated.addListener((id, changeInfo, tab) => {
  if (tab.url.includes('en.wikipedia')) {
    browser.pageAction
      .show(tab.id)
      .then(() => {
        browser.pageAction.setIcon({ tabId: tab.id, path: "icons/icon-idle-48.png" })
    })
  } else {
    browser.pageAction.hide(tab.id)
  }
  browser.pageAction.setTitle({ tabId: tab.id, title: 'iLearn Button' })
})

browser.pageAction.onClicked.addListener((e) => {
  browser.pageAction
    .setIcon({ tabId: e.id, path: "icons/icon-active-128.png" })

  browser.tabs.sendMessage(e.id, { activate: true })
  console.log(e)

  // browser.notifications.create({
  //   type: 'basic',
  //   iconUrl: browser.extension.getURL(e.favIconUrl),
  //   title: 'Added to iLearn',
  //   message: `Added this page ${e.title} <${e.id}> to ilearn. (not really)`,
  // })
})
