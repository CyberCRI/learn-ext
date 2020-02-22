import React from 'react'
import { renderReactComponent } from '~mixins/react-helpers'
import { Helmet } from 'react-helmet'

import SettingsTabs from './tabs'
import { setup } from '../_commons'
import { i18n } from '@ilearn/modules/i18n'
import './style.scss'


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

window.addEventListener('load', async () => {
  await setup()
  renderReactComponent('settings', SettingsContainer)
})
