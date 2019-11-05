import React from 'react'
import { Helmet } from 'react-helmet'

import { i18n } from '@ilearn/modules/i18n'
import { setupMapView } from './renderer'
import { fetchResources } from './store'
import { OverlayCards } from './overlays'

const DiscoverView = () => {
  return (
    <div className='discover'>
      <Helmet>
        <title>{i18n.t('pages.discover.meta.pageTitle')}</title>
      </Helmet>
      <OverlayCards/>
    </div>
  )
}

const setupInstance = async (config) => {
  setupMapView(config)
  fetchResources()
}

export { DiscoverView, setupInstance }
