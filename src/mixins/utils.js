import React from 'react'
import ReactDOM from 'react-dom'
import $ from 'cash-dom'
import uuid_v5 from 'uuid/v5'
import md5 from 'js-md5'
import _ from 'lodash'
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


export const getMetaAttribute = (name) => {
  return $(`meta[name="${name}"]`).attr('content')
}

export const getCanonicalUrl = () => {
  const canonical = $('link[rel="canonical"]').attr('href')
  if (canonical) {
    return canonical
  } else {
    return document.location.href
  }
}

export const nsuuid = (param) => {
  // Read as: Namespace UUID.
  // Generate a uuid within application namespace appending the parameters.
  return uuid_v5(`${env.uuid5_namespace}/${param}`, uuid_v5.URL)
}

export const renderReactComponent = (selector, component, props) => {
  const el = document.getElementById(selector)

  if (el) {
    const dataAttrs = $(el).data() || {}
    const extraProps = props || {}

    // [!] We must capture the `component` object in this closure. Otherwise,
    //     minification would "optimise" it and it won't work. :(
    const ReactComponent = component
    return ReactDOM.render(<ReactComponent {...dataAttrs} {...extraProps} />, el)
  } else {
    console.info(`Component <${component.name}> not mounted. <${selector}> missing.`)
  }
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

export const userId = (email) => {
  // To obfuscate the user email, a simple hash of user email is used.
  return md5(`ilearn_${email}`)
}

export const cssUrlVars = (vars) => {
  // Helper method to set inline CSS Variables value for a url.
  // Expects an object with <name: url> entries.
  // Return a style object.
  return _(vars)
    .mapKeys((value, key) => `--${key}`)
    .mapValues((value) => `url(${value})`)
    .thru((style) => ({ style }))
    .value()
}
