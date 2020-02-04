import { isUndefined } from 'lodash'

const attemptParseJson = (value) => {
  try {
    return JSON.parse(value)
  } catch (e) {
    return value
  }
}

export const LocalStorage = {
  get (key, fallback) {
    const value = window.localStorage.getItem(key)
    if (isUndefined(value)) {
      return fallback
    }
    return attemptParseJson(value)
  },

  set (key, value) {
    window.localStorage.setItem(key, JSON.stringify(value))
    return value
  },
}
