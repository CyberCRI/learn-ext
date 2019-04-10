import React from 'react'
import { Button } from '@blueprintjs/core'
import { MdSettingsApplications, MdExplore } from 'react-icons/md'

const ToolButtons = [
  { id: 'dashboard', label: 'Dashboard', icon: <MdExplore/> },
  { id: 'settings', label: 'Settings', icon: <MdSettingsApplications/> },
]

export const Tools = (props) => {
  const buildProps = ({ id, label, icon }) => {
    return {
      key: id,
      role: id,
      text: label,
      icon: icon
    }
  }
  return (
    <div className='popover-tools'>
      {ToolButtons.map((btn) =>
        <Button {...buildProps(btn)}/>
      )}
    </div>
  )
}
