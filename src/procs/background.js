import { ExtensionPages } from './reactors'
import { InstallEventReason, IconStack } from './structs'
import { RuntimeHook, RuntimeEvents } from './runtime-hooks'
import { Storage } from './wrappers'
import { browser } from './stubs'
import { initContextMenus } from './contextMenus'

const tabState = {}
const ports = {}

const broadcastToPorts = (tabId, payload) => {
  // Notify all the listener ports of tabId
  for (let [name, p] of Object.entries(ports[tabId])) {
    try {
      p.postMessage(payload)
    } catch {
      console.debug(`Port for ${name} is closed`)
    }
  }
}

const dispatchReaction = (msg) => {
  if (msg.action == 'dashboard') {
    ExtensionPages.dashboard.open()
  }
  if (msg.action == 'settings') {
    ExtensionPages.settings.open()
  }
  console.info(`Consuming action=<${msg.action}>`, msg)
}

const reactOnInstalled = async ({ reason, temporary }) => {
  if (reason === InstallEventReason.installed) {
    if (temporary) {
      // We used to set a demo user info here. It's not needed anymore.
      // This is left in for later refactor.
    } else {
      // Bonjour les enfants!
      // This is not a temporary installation. Lets open onboarding page!
      ExtensionPages.onboarding.open()
    }
  }

  if (reason === InstallEventReason.updated) {
    // Extension was updated. Later, we might open a changelog page. For now,
    // do nothing at all.
    const shouldOpenChangelogs = await Storage.get('pref.autoShowChangelog', true)
    console.info('Extension was updated. Should Open Changelog:', shouldOpenChangelogs)
    if (shouldOpenChangelogs) {
      ExtensionPages.changelog.open()
    }
  }
}

const getTabInfo = async (tabId) => {
  const info = await browser.tabs.get(tabId)
  // Let the caller know whether we have been granted full access to the tab.
  const fullAccess = !!info.url
  const state = tabState[tabId]
  return { fullAccess, state, ...info }
}

const getCurrentTabId = async () => {
  const tabs = await browser.tabs.query({
    active: true,
    currentWindow: true,
  })

  if (tabs.length !== 1) {
    throw new Error('Could not find the currently active tab')
  }

  return tabs[0].id
}

const setupConnection = (port) => {
  // Attach context callbacks on port.
  const name = port.name
  const tabId = port.sender.tab.id

  if (!ports[tabId]) {
    ports[tabId] = {}
  }

  ports[tabId][name] = port

  console.debug(`[Connected] Port< tab=${tabId} name=${name} >`)

  port.onDisconnect.addListener((e) => {
    console.log(`[Disconnected] Port< tab=${tabId} >`)
    tabState[tabId] = {}
  })

  port.onMessage.addListener(({ context, ...msg }) => {
    if (context === 'tabState') {
      tabState[tabId] = msg.payload
      updateBrowserActionIcon(tabId)
    } else if (context === 'reactor') {
      dispatchReaction(msg.payload)
    } else if (context === 'broadcast') {
      broadcastToPorts(tabId, msg.payload)
    } else if (context === 'mounted') {
      getTabInfo(tabId).then((tabInfo) => {
        port.postMessage({ action: 'postMount', tabInfo })
        broadcastToPorts(tabId, { action: 'open' })
      })
    }
  })
}

const updateBrowserActionIcon = (tabId) => {
  const state = tabState[tabId]
  const iconPath = state.isOpen ? IconStack.action.active : IconStack.action.idle

  return browser.browserAction.setIcon({ tabId, path: iconPath })
}

const maybeInjectContentScripts = async (tabId) => {
  const execCScript = async (payload) => {
    return browser.tabs.executeScript(tabId, payload)
  }

  // Check if content script isn't already inserted.
  // If it is, then ilearn-ext-frame element would be in the DOM. Note that
  // the resolved value of executeScript promise is an array, with the assertion
  // value as the sole element.
  const shouldExecute = await execCScript({
    code: 'document.getElementById("ilearn-ext-frame") === null',
  })

  if (shouldExecute[0]) {
    console.debug(`Inserting CS in tab=${tabId}`)
    // Also, initialize the tabState value!
    tabState[tabId] = { isOpen: false }
    await execCScript({ file: '/chunks/vendors.js' })
    await execCScript({ file: '/chunks/content_script.js' })
  }
}

const maybeTogglePopover = async (tabId) => {
  // Ensure content scripts are already executed, before handling the action.
  // Since it executes the entire scripts, we can be sure that the port would
  // already be there.
  await maybeInjectContentScripts(tabId)
  const action = tabState[tabId].isOpen ? 'close' : 'open'

  broadcastToPorts(tabId, { action })
}

const didClickBrowserAction = async (e) => {
  const tabId = await getCurrentTabId()
  maybeTogglePopover(tabId)
}

const didSelectPageMenuItem = async (e) => {
  const tabId = await getCurrentTabId()
  maybeTogglePopover(tabId)
}

// Attach event listeners.
new RuntimeHook(RuntimeEvents.onInstall, reactOnInstalled).attach()
new RuntimeHook(RuntimeEvents.onConnect, setupConnection).attach()

browser.browserAction.onClicked.addListener(didClickBrowserAction)

initContextMenus({
  pageMenu: didSelectPageMenuItem,
})
