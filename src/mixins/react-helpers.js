import React from 'react'
import ReactDOM from 'react-dom'
import $ from 'cash-dom'

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
