import React from 'react'
import ReactDOM from 'react-dom'
import reqwest from 'reqwest'
import $ from 'jquery'
import uuid_v5 from 'uuid/v5'


const request = (params) => {
  // Wrap `reqwest` with common flags and parameters.
  // Additionally, a `cancel` method is attached allowing distinguishing errors
  // from a cancelled AJAX request.

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

const nsuuid = (param) => {
  // Read as: Namespace UUID.
  // Generate a uuid within application namespace appending the parameters.
  return uuid_v5(`${env.uuid5_namespace}/${param}`, uuid_v5.URL)
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


export { request, renderReactComponent, getCanonicalUrl, nsuuid }
