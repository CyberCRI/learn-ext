import React from 'react'
import { useStore } from 'effector-react'
import { Dialog, Button, InputGroup, FormGroup, Callout } from '@blueprintjs/core'
import { RiAnchorLine } from 'react-icons/ri'

import { IngressAPI } from '@ilearn/modules/api'

import { ResourceEditorControl } from '~components/resources/store'

import { $AddToDialog, AddToDialogControl } from './store'

import './style.scss'


const AddToDialog = () => {
  const dialog = useStore($AddToDialog)
  const [ url, setUrl ] = React.useState('')
  const [ loading, setLoading ] = React.useState(false)
  const [ error, setErrorState ] = React.useState(false)

  const didClickNext = async () => {
    setErrorState(false)
    setLoading(true)
    let preprocResponse, doc2vecResponse
    try {
      preprocResponse = await IngressAPI.preprocess({ link: url })

      if (preprocResponse.error_type !== undefined) {
        throw new Error('Cannot fetch data')
      }
    } catch (e) {
      setErrorState(true)
      setLoading(false)
      return
    }
    try {
      doc2vecResponse = await IngressAPI.doc2vec({ link: url, lang: preprocResponse.lang })
    } catch (e) {
      setErrorState(true)
      setLoading(false)
      return
    }

    const resource = {
      url,
      title: preprocResponse.title,
      lang: preprocResponse.lang,
      hashtags: [],
      concepts: doc2vecResponse,
    }
    setErrorState(false)
    setLoading(false)
    AddToDialogControl.hide()
    ResourceEditorControl.show({ mode: 'add', resource })
  }

  return (
    <Dialog
      isOpen={dialog.isOpen}
      onClose={AddToDialogControl.hide}
      className='add-to-dialog'>
      <div className='body'>
        <Button
          onClick={AddToDialogControl.hide}
          icon='cross'
          className='close-button'/>
        <div className='intro'>
          <span className='icon'><RiAnchorLine/></span>
          <div>
            <h2>Add to WeLearn</h2>
            <p>Enter a Link to the webpage you wish to add.</p>
          </div>
        </div>
        <FormGroup label='Link'>
          <InputGroup
            placeholder='https://example.com'
            leftIcon='link'
            name='url'
            value={url}
            onChange={e => setUrl(e.target.value)}/>
        </FormGroup>

        <div className='action'>
          <Button
            icon='arrow-right'
            text='Next'
            intent='success'
            large
            onClick={didClickNext}
            loading={loading}/>
          {loading && <Callout intent='primary' icon='predictive-analysis'>Processing Link...</Callout>}
          {error && <Callout intent='danger' icon='offline'>An Error occurred. Please verify the link and try again.</Callout>}
        </div>
      </div>
    </Dialog>
  )
}


export const AddToButton = () => {
  return <>
    <AddToDialog/>
    <Button
      text='Add to WeLearn'
      intent='primary'
      onClick={AddToDialogControl.show}
      icon={<RiAnchorLine/>}/>
  </>
}
