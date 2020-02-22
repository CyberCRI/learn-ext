import React from 'react'
import { Button } from '@blueprintjs/core'
import { Port } from '~procs/portal'
import { i18n } from '@ilearn/modules/i18n'

const dispatcher = new Port('PopoverTools').connect()

export const PopoverTools = (props) => {
  const i18nT = i18n.context('navigationBar.links')
  const buttons = [
    { id: 'dashboard', label: i18nT('dashboard.label'), icon: 'book' },
    { id: 'settings', label: i18nT('settings.label'), icon: 'settings' },
  ]

  const buildProps = ({ id, label, icon }) => {
    return {
      key: id,
      role: id,
      text: label,
      icon: icon,
      className: 'tool-button',
      onClick: () => dispatcher.invokeReaction(id),
    }
  }
  return (
    <div className='popover-tools bp3-dark'>
      {buttons.map((btn) =>
        <Button small minimal {...buildProps(btn)}/>
      )}
    </div>
  )
}
