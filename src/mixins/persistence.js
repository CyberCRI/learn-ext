import { browser } from '~procs/stubs'
import { context, Runtime } from '~mixins/utils'


class ExtensionStorage {
  async get (key) {
    const value = await browser.storage.local.get(key)
    return JSON.parse(value[key])
  }

  async set (key, value) {
    await browser.storage.local.set({
      [key]: JSON.stringify(value),
    })
  }
}

class WebStorage {
  async get (key) {
    const value = window.localStorage.getItem(key)
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  }

  async set (key, value) {
    window.localStorage.setItem(key, JSON.stringify(value))
  }
}

let store

if (context() === Runtime.extension) {
  store = new ExtensionStorage()
} else {
  store = new WebStorage()
}

export default store
