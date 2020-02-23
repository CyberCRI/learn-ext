import { browser } from '~procs/stubs'
import Enum from 'enum'

// Enumerate the context this code is running into.
// -> extension: Running under extension process (can access browser/chrome) API
// -> browser: Running in a webpage
// -> node: Running inside nodejs runtime.
export const Runtime = new Enum([
  'extension',
  'browser',
  'node',
], { name: 'Runtime', ignoreCase: true })


export const runtimeContext = {
  get name () {
    return this.isBrowser ? Runtime.browser : Runtime.extension
  },
  get isExtension () {
    try {
      return browser.runtime.id && true
    } catch (e) {
    }
    try {
      return chrome.runtime.id && true
    } catch {
    }
    return false
  },

  get isBrowser () {
    return !this.isExtension
  },
}

export const context = () => {
  // Perform globals existence test to find the context we're currently in.
  //
  // Within the Extension context, either `browser` or, `chrome` are defined.
  // Inside a webpage, `window` is defined.
  // In nodejs runtime, `global` is defined.
  //
  // This function tries to access extension runtime id with both `browser` and
  // `chrome` functions, which is always available in extension processes/pages.
  // For regular webpage context, we check if `window.document` is accessible.

  try {
    return browser.runtime.id && Runtime.extension
  } catch {}

  try {
    return chrome.runtime.id && Runtime.extension
  } catch {}

  try {
    return window.document && Runtime.browser
  } catch {}

  return Runtime.node
}
