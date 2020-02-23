// Wraps LocalStorage access which encodes objects to JSON.
// There are a couple of other similar mixins in this code base. I haven't yet
// identified where can they be generalised. Until then, we'll keep copies to
// avoid leaky abstraction here.
//
// [!todo] Identify if a fallback is needed (and possible) for when LocalStorage
// is not available. It may be possible to use client-side cookies but that
// doesn't sound pretty.
//
// [!todo] Is it necessary to encode values in JSON?

const attemptParseJson = (value) => {
  try {
    return JSON.parse(value)
  } catch (e) {
    return value
  }
}

const isStorageAvailable = () => {
  try {
    // Attempt to access localstorage. If it works, we're fine. Otherwise no
    // access to localstorage available.
    window.localStorage.length
    return true
  } catch (e) {
    return false
  }
}

export const LocalStorage = {
  get (key, fallback) {
    if (!isStorageAvailable()) {
      console.warn('LocalStorage unavailable.')
      return fallback
    }
    const value = window.localStorage.getItem(key)
    if (typeof value === undefined) {
      return fallback
    }
    return attemptParseJson(value)
  },

  set (key, value) {
    window.localStorage.setItem(key, JSON.stringify(value))
    return value
  },
}
