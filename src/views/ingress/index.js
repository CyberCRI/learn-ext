import React from 'react'

import { renderReactComponent } from '~mixins/react-helpers'
import { UrlInfo } from './url-info'
import { ConceptSuggest } from '~components/concepts'
import { Button } from '@blueprintjs/core'

import './style.scss'

export const IngressView = (props) => {
  return <>
    <h3>Ingress</h3>
    <p>Add this URL to your WeLearn library.</p>
    <UrlInfo url={props.rurl}/>
    <ConceptSuggest/>
    <Button icon='add' text='Add to your Library'/>
    <Button icon='cross' text='Cancel'/>
  </>
}


export const setup = async (params) => {
  // Initialise dependencies.
  // Check for token and url -> Token can be provided either in cookies, or url
  // hash, or query params. This token should be sent as Authorization header.

  renderReactComponent('ingress', IngressView, params)
}
