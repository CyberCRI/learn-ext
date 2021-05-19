import React from 'react'
import _ from 'lodash'
import { useStore } from 'effector-react'
import { Dialog, Button, Callout, TextArea, Popover } from '@blueprintjs/core'
import { useAsyncFn } from 'react-use'
import styled from 'styled-components'

import { FaviconPill, UrlPill } from '~components/pills'

import { API, CarteSearchAPI } from '@ilearn/modules/api'

import { ResourceCard } from '~components/cards/resources'

import { HashTagsInput, WikiConceptInput } from '~components/inputs'
import { $EditDialog, ResourceEditorControl } from './store'


const DeletePopoverContainer = styled.div`
  padding: 10px;
  max-width: 400px;

  .actions {
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
  }
`

const DeleteButton = ({ onClick, loading }) => {
  const [ isOpen, setIsOpen ] = React.useState(false)

  const DeleteConfirmation = (
    <DeletePopoverContainer>
      <Callout title='Confirm Deletion' intent='warning' icon='warning-sign'>
        <p>Deleting the resource will remove it from your Library.</p>
      </Callout>

      <div className='actions'>
        <Button text='Cancel' icon='cross' onClick={() => setIsOpen(false)}/>
        <Button text='Delete' onClick={onClick} loading={loading} icon='trash' intent='danger'/>
      </div>
    </DeletePopoverContainer>
  )

  const DeletePopoverButton = <Button
    text='Delete Resource'
    icon='trash'
    outlined
    minimal
    active={isOpen}
    onClick={() => setIsOpen(!isOpen)}/>

  return (
    <Popover
      content={DeleteConfirmation}
      target={DeletePopoverButton}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}/>
  )
}


const EditorForm = ({ resource, mode }) => {
  const [ comment, setComment ] = React.useState(resource.notes)
  const [ concepts, setConcepts ] = React.useState(resource.concepts)
  const [ tags, setTags ] = React.useState(resource.hashtags.map((t) => ({ id: t, label: t })))
  const [ availableTags, setAvailableTags ] = React.useState([])
  const [ saveCount, setSaveCount ] = React.useState(0)
  const [ deleting, setDeleteState ] = React.useState(false)

  React.useEffect(() => {
    // Do stuff in here after authn is loaded.
    //
    // Load personal hashtags in for initialising list of available tags.
    CarteSearchAPI.hashtagList()
      .then((hashtags) => {
        setAvailableTags(hashtags)
      })
  }, [])

  const didDeleteResource = () => {
    setDeleteState(true)
    API
      .deleteResource({ resource_id: resource.resource_id })
      .then(() => {
        ResourceEditorControl.hide()
      })
  }

  const [ bookmarkState, addBookmark ] = useAsyncFn(async () => {
    const payload = {
      title: resource.title,
      url: resource.url,
      lang: resource.lang,
      concepts,
      hashtags: tags.map(t => t.label),
      notes: comment,
    }
    await fetch(`${env.ngapi_host}/api/users/resource`, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      }})
    ResourceEditorControl.hide()
    setSaveCount(saveCount + 1)
  }, [concepts, comment, tags])

  const didSave = (!bookmarkState.error && saveCount > 0)

  return (
    <div>
      <div className='page-action'>
        <h3 className='title'>Concepts on this Page</h3>

        <WikiConceptInput
          lang={resource.lang}
          onChange={value => setConcepts(value)}
          value={concepts}
          usePortal={false}/>

        <h3 className='title'>Personal Hashtags and Notes</h3>

        <div className='input-container'>
          <HashTagsInput
            onChange={value => setTags(value)}
            choices={availableTags}
            value={tags}/>
        </div>

        <div className='input-container'>
          <TextArea
            growVertically={true}
            fill
            onChange={e => setComment(e.target.value)}
            placeholder='Add notes about the Resource'
            value={comment}/>
        </div>
      </div>
      <div className='action-buttons'>
        { mode === 'edit' && <DeleteButton onClick={didDeleteResource} loading={deleting}/> }
        <div className='spacer'/>

        <Button
          text='Save Changes'
          intent={didSave ? 'success' : 'primary'}
          icon={didSave ? 'tick-circle' : 'floppy-disk'}
          onClick={addBookmark}
          loading={bookmarkState.loading}
          className='save-btn'/>
      </div>
    </div>
  )
}


export const ResourceEditDialog = (props) => {
  const dialog = useStore($EditDialog)
  const resource = dialog.resource
  const mode = dialog.mode

  let editorModeProps = {
    icon: mode === 'edit' ? 'edit' : 'add',
    title: mode === 'edit' ? 'Edit Resource' : 'Add Resource',
  }

  return (
    <Dialog
      isOpen={dialog.isOpen}
      onClose={ResourceEditorControl.hide}
      className='dialog edit-resource'
      {...editorModeProps}
      usePortal={true}>

      <div className='body'>
        <div className='preview-card'>
          {resource && <ResourceCard url={resource.url} title={resource.title}/>}
        </div>
        <div className='editor'>
          {resource && <EditorForm resource={resource} mode={mode}/>}
        </div>
      </div>
    </Dialog>
  )
}
