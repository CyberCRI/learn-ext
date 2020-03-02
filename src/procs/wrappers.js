// Utility toolbelt for webext APIs.
import { browser } from './stubs'


export const i18n = (key, subs) => {
  // Return localised string from locale file.
  // Note that this only works in context of the extension. Hence it should not
  // be used elsewhere outside extension process.
  //
  // We'll use template strings in lodash for substitutions.
  //
  // [NOTES]
  // Additionally, this function transforms the key so "dot syntax" is valid.
  // Essentially, by using yaml locale files, we are able to group messages
  // together (check Readme in assets/locales).
  //
  // [!note] I removed lodash template since the locales using them are not used
  // in extension process.
  return browser.i18n.getMessage(key.replace(/\./g, '_'))
}

export const i18nContext = (prefix) => {
  // Set a key-prefix for "contexts" subset for component based locales.
  return (key, subs) => i18n(`${prefix}.${key}`, subs)
}

export const Storage = {
  get: async (key, fallback) => {
    const value = await browser.storage.local.get(key)
    if (typeof value[key] === 'undefined') {
      return fallback
    }
    try {
      return JSON.parse(value[key])
    } catch (e) {
      return value[key]
    }
  },
  set: async (key, value) => {
    return browser.storage.local.set({
      [key]: JSON.stringify(value),
    })
  },
  remove: async (key) => {
    return browser.storage.local.remove(key)
  },
}
