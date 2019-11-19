import React from 'react'
import { renderReactComponent } from '~mixins/react-helpers'
import { Helmet } from 'react-helmet'

import SettingsTabs from './tabs'
import { i18n } from '@ilearn/modules/i18n'
import './style.sass'


const SettingsContainer = (props) => {
  return (
    <div>
      <Helmet>
        <title>{i18n.t('pages.settings.meta.pageTitle')}</title>
      </Helmet>
      <SettingsTabs />
    </div>
  )
}

document.addEventListener('apploaded', () => {
  renderReactComponent('settings', SettingsContainer)
})
