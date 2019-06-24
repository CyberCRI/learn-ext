import React from 'react'
import { Button } from '@blueprintjs/core'
import { MdSettingsApplications, MdExplore } from 'react-icons/md'
import { Port } from '~procs/portal'
import { i18n } from '~procs/wrappers'

const ToolButtons = [
  { id: 'dashboard', label: i18n('navigationBar.links.dashboard.label'), icon: <MdExplore/> },
  { id: 'settings', xlabel: i18n('navigationBar.links.settings.label'), icon: <MdSettingsApplications/> },
]

const dispatcher = new Port('PopoverTools').connect()

export const PopoverTools = (props) => {
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
      {ToolButtons.map((btn) =>
        <Button small minimal {...buildProps(btn)}/>
      )}
    </div>
  )
}
