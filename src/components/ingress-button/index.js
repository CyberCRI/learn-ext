import React, { useState } from 'react'
import { createStore, createApi } from 'effector'
import { useStore } from 'effector-react'
import _ from 'lodash'

import { Dialog, Button, Callout } from '@blueprintjs/core'
import { InputGroup, Label, FormGroup } from '@blueprintjs/core'

import { ConceptSuggest, ConceptList, ConceptListLoadingState } from '~components/concepts'
import { ResourceCard } from '~components/cards/resources'
import { IngressAPI } from '@ilearn/modules/api'


const $dialogVisibility = createStore(false)
const dialogControl = createApi($dialogVisibility, {
  show: () => true,
  hide: () => false,
  toggle: (state) => !state,
})

const ConceptInput = ({ concepts, onChange }) => {
  //- Renders concept list with concept suggest. Manages the concept list.
  const didPick = (item) => {
    onChange(_.unionBy(concepts, [item], 'wikidata_id'))
  }
  const didRemove = (item) => {
    onChange(_.differenceBy(concepts, [item], 'wikidata_id'))
  }
  return <div>
    <ConceptList concepts={concepts} removable onRemove={didRemove}/>
    <ConceptSuggest onSelect={didPick}/>
  </div>
}

const fetchConceptsFromUrl = async (url) => {
  const preprocData = await IngressAPI.preprocess({ link: url })
  const d2v = await IngressAPI.doc2vec({ link: preprocData.url, lang: preprocData.lang })
  return { ...preprocData, concepts: d2v }
}


const IngressDialog = (props) => {
  const visibility = useStore($dialogVisibility)
  const [ url, setUrl ] = useState('')
  const [ concepts, setConcepts ] = useState([])
  const [ page, setPage ] = useState()

  const didEnterUrl = async () => {
    try {
      const page = await fetchConceptsFromUrl(url)
      setPage(page)
      setConcepts(page.concepts)
    } catch {}
  }

  return (
    <Dialog
      isOpen={visibility}
      onClose={dialogControl.hide}
      title={'Add a Resource'}
      icon='insert'
      className='login-dialog'>
      <div className='bp3-dialog-body'>
        <FormGroup label='Paste a link here'>
          <InputGroup placeholder='https://example.com/article'
            value={url}
            onChange={e => setUrl(e.target.value)}/>
        </FormGroup>
        <Button text='Next' onClick={didEnterUrl}/>
        <ConceptInput concepts={concepts} onChange={setConcepts}/>

        { page && <ResourceCard {...page}/> }

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
