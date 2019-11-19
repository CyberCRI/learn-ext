import { browser } from '~procs/stubs'
import { runtimeContext } from '~mixins/utils'


const attemptParseJson = (value) => {
  try {
    return JSON.parse(value)
  } catch (e) {
    return value
  }
}

class ExtensionStorage {
  async get (key) {
    const value = await browser.storage.local.get(key)
    return attemptParseJson(value[key])
  }

  set (key, value) {
    browser.storage.local.set({
      [key]: JSON.stringify(value),
    })
    return this
  }
}

class WebStorage {
  async get (key) {
    const value = window.localStorage.getItem(key)
    return attemptParseJson(value)
  }

  set (key, value) {
    window.localStorage.setItem(key, JSON.stringify(value))
    return this
  }
}

const store = runtimeContext.isBrowser ? new WebStorage() : new ExtensionStorage()

export default store
