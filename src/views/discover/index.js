import React from 'react'
import { Helmet } from 'react-helmet'

import { renderReactComponent } from '~mixins/react-helpers'
import { i18n } from '@ilearn/modules/i18n'
import { setupMapView } from './renderer'
import { OverlayCards, OverlayConcepts, OverlayTools } from './overlays'
import { pickLayer } from './store'

import './styles.scss'

const DiscoverView = () => {
  return (
    <>
      <Helmet>
        <title>{i18n.t('pages.discover.meta.pageTitle')}</title>
      </Helmet>
      <OverlayCards/>
    </>
  )
}

export const renderView = () => {
  renderReactComponent('overlay-tools', OverlayTools)
  renderReactComponent('overlay-concepts', OverlayConcepts)
  renderReactComponent('discover-view', DiscoverView)
}

export const setupInstance = async (config) => {
  await setupMapView(config)
  pickLayer('everything')
}
