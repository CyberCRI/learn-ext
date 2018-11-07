import React from 'react'
import reqwest from 'reqwest'
import ReactDOM from 'react-dom'
import $ from 'jquery'


const request = (params) => {
  const defaults = {
    type: 'json',
    method: 'get',
    contentType: 'application/json',
  }

  let payload = {...defaults, ...params}

  const r = reqwest(payload)

  r.cancel = () => {
    r.request.cancelled = true
    r.abort()
  }
  return r
}


const getMetaAttribute = (name) => {
  return $(`meta[name="${name}"]`).attr('content')
}

const getCanonicalUrl = () => {
  const canonical = $('link[rel="canonical"]').attr('href')
  if (canonical) {
    return canonical
  } else {
    return document.location.href
  }
}

const renderReactComponent = (selector, component, props) => {
  const el = document.getElementById(selector)

  if (el) {
    const dataAttrs = $(el).data() || {}
    const extraProps = props || {}
    const ReactComponent = component
    return ReactDOM.render(<ReactComponent {...dataAttrs} {...extraProps} />, el)
  }
}


export { request, renderReactComponent, getCanonicalUrl }
