import React from 'react'
import { Helmet } from 'react-helmet'

import { renderReactComponent } from '~mixins/react-helpers'
import { i18n } from '@ilearn/modules/i18n'
import { setupMapView } from './renderer'
import { fetchResources } from './store'
import { OverlayCards, OverlayConcepts } from './overlays'

import './styles.scss'

const DiscoverView = () => {
  return (
    <div>
      <Helmet>
        <title>{i18n.t('pages.discover.meta.pageTitle')}</title>
      </Helmet>
      <OverlayCards/>
    </div>
  )
}

export const renderView = () => {
  renderReactComponent('overlay-concepts', OverlayConcepts)
  renderReactComponent('discover-view', DiscoverView)
}

export const setupInstance = async (config) => {
  setupMapView(config)
  fetchResources({ start: 1 })
}
