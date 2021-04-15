import React from 'react'
import { createStore, createApi } from 'effector'
import { useStore } from 'effector-react'

import { Dialog, Button, FormGroup, InputGroup } from '@blueprintjs/core'

import { ServiceAPI } from '@ilearn/modules/api'
import { GlobalToaster } from '../_commons/notifications'


const $createGroupDialogVisibility = createStore(false)
const CreateGroupDialogControl = createApi($createGroupDialogVisibility, {
  show: () => true,
  hide: () => false,
})

const CreateGroupDialog = (props) => {
  const visible = useStore($createGroupDialogVisibility)
  const [loading, setLoading] = React.useState(false)
  const [groupLabel, setGroupLabel] = React.useState('')

  const didClickCreate = async () => {
    if (!groupLabel.trim().length) {
      return
    }
    setLoading(true)
    await ServiceAPI.createGroup({ label: groupLabel })
    setLoading(false)
    GlobalToaster.show({
      message: 'Created group',
      icon: 'tick',
      intent: 'success',
      timeout: 10000,
    })
    CreateGroupDialogControl.hide()
  }

  const didCloseDialog = () => {
    CreateGroupDialogControl.hide()
    props.onClose && props.onClose()
  }

  return (
    <Dialog
      isOpen={visible}
      onClose={didCloseDialog}
      title='Create Group'
      icon='plus'>
      <div className='create-group-dialog'>
        <FormGroup label='Group Name'>
          <InputGroup
            placeholder='Group Name'
            value={groupLabel}
            onChange={e => setGroupLabel(e.target.value)}/>
        </FormGroup>
        <Button text='Create' onClick={didClickCreate} loading={loading}/>
      </div>
    </Dialog>
  )
}

export const CreateGroup = (props) => {
  return <>
    <CreateGroupDialog onClose={props.onClose}/>
    <Button onClick={CreateGroupDialogControl.show} icon='plus' text='Create Group'/>
  </>
}
