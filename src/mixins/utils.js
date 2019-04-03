import React from 'react'
import ReactDOM from 'react-dom'
import $ from 'cash-dom'
import uuid_v5 from 'uuid/v5'
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
  // Perform global variable existence test to find the context we're currently
  // inside.
  //
  // Within the Extension context, either `browser` or, `chrome` are defined.
  // Inside a webpage, `window` is defined.
  // In nodejs runtime, `global` is defined.
  //
  // This function tries to see which of these three (`browser`, `chrome`,
  // `window`) are available, and returns the Context Flag.

  try {
    _.isObjectLike(browser)
    return Runtime.extension
  } catch {}
  try {
    _.isObjectLike(chrome)
    return Runtime.extension
  } catch {}

  try {
    _.isObjectLike(window)
    return Runtime.browser
  } catch {}

  return Runtime.node
}
