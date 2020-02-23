import React from 'react'

import { renderReactComponent } from '~mixins/react-helpers'
import { Ingress } from './view'
import { ConceptSuggest } from '~components/concepts'
import { Button } from '@blueprintjs/core'

import './style.scss'


export const setup = async (params) => {
  // Initialise dependencies.
  // Check for token and url -> Token can be provided either in cookies, or url
  // hash, or query params. This token should be sent as Authorization header.

  renderReactComponent('ingress', Ingress, params)
}
