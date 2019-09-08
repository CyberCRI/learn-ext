import React from 'react'
import { renderReactComponent } from '~mixins/react-helpers'
import * as FiIcon from 'react-icons/fi'
import { IconContext } from 'react-icons'
import SettingsTabs from './tabs'
import './style.sass'


const SettingsContainer = (props) => {
  return (
    <div>
      <IconContext.Provider value={{ size: '3em', color: '#fff' }}>
        <div><FiIcon.FiSettings/></div>
      </IconContext.Provider>
      <SettingsTabs />
    </div>
  )
}

document.addEventListener('apploaded', () => {
  renderReactComponent('settings', SettingsContainer)
})
