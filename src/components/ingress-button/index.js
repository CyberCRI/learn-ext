import React, { useState } from 'react'
import { createStore, createApi } from 'effector'
import { useStore } from 'effector-react'

import { Dialog, Button, Callout } from '@blueprintjs/core'
import { InputGroup, Label } from '@blueprintjs/core'

import { ConceptSuggest, ConceptList, ConceptListLoadingState } from '~components/concepts'

const $dialogVisibility = createStore(false)
const dialogControl = createApi($dialogVisibility, {
  show: () => true,
  hide: () => false,
  toggle: (state) => !state,
})


const IngressDialog = (props) => {
  const visibility = useStore($dialogVisibility)
  const [ concepts, setConcepts ] = useState([])

  return (
    <Dialog
      isOpen={visibility}
      onClose={dialogControl.hide}
      title={'Add a url'}
      icon='log-in'
      className='login-dialog'>
      <div>
        <Label>
          Paste a link here
          <InputGroup/>
        </Label>

        <ConceptList concepts={concepts}/>

        <ConceptSuggest onSelect={() => {}}/>
        <Button text='Save'/>
      </div>
    </Dialog>
  )
}

const AddToWelearnButton = (props) => {
  return <>
    <IngressDialog/>
    <Button
      onClick={dialogControl.toggle}
      icon='log-in'
      minimal
      intent='primary'
      text='AddTo'/>
  </>
}

export default AddToWelearnButton
