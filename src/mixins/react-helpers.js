import React from 'react'
import ReactDOM from 'react-dom'

export const renderReactComponent = async (selector, component, props) => {
  const el = document.getElementById(selector)

  if (el) {
    // [!] We must capture the `component` object in this closure. Otherwise,
    //     minification would "optimise" it and it won't work. :(
    const ReactComponent = component
    return ReactDOM.render(<ReactComponent {...props} />, el)
  } else {
    console.info(`Component <${component.name}> not mounted. <${selector}> missing.`)
  }
}
