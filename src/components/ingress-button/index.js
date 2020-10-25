import React, { useState } from 'react'
import { createStore, createApi } from 'effector'
import { useStore } from 'effector-react'

import { Dialog, Button, Callout } from '@blueprintjs/core'
import { InputGroup, Label, FormGroup } from '@blueprintjs/core'

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
      title={'Add a Resource'}
      icon='insert'
      className='login-dialog'>
      <div className='bp3-dialog-body'>
        <FormGroup label='Paste a link here'>
          <InputGroup placeholder='https://example.com/article'/>
        </FormGroup>
        <Button text='Next'/>

        <ConceptList concepts={concepts}/>
        <ConceptSuggest onSelect={(c) => {}}/>
      </div>
      <div className='bp3-dialog-footer'>
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
      icon='insert'
      minimal
      text='Add Resource'/>
  </>
}

export default AddToWelearnButton
