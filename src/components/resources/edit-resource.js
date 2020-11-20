import React from 'react'
import _ from 'lodash'
import { useStore } from 'effector-react'
import { AnchorButton } from '@blueprintjs/core'
import { Dialog, Button, Callout, TextArea } from '@blueprintjs/core'
import { useAsyncFn } from 'react-use'
import styled from 'styled-components'

import { FaviconPill, UrlPill } from '~components/pills'

import { API, CarteSearchAPI, IngressAPI } from '@ilearn/modules/api'

import { ResourceCard } from '~components/cards/resources'
import { ConceptList, ConceptListLoadingState } from '~components/concepts'
import { ConceptSuggest } from '~components/concepts/suggest'

import { HashTagsInput } from './hashtag-input'
import { $EditDialog, ResourceEditorControl } from './store'


export const PageInfo = ({ title, url }) => {
  return (
    <div className='page-infobox'>
      <FaviconPill className='favicon' url={url} title={title}/>
      <h3>{title}</h3>
      <UrlPill url={url}/>
    </div>
  )
}

const HashTagContainer = styled.div`
  padding: 5px 10px;
`
const CommentInputContainer = styled.div`
  padding: 5px 10px;
`

const EditorForm = ({ resource }) => {
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

  const didAddConcept = (concept) => {
    const newSelection = _.unionBy(concepts, [concept], 'wikidata_id')
    setConcepts(newSelection)
  }
  const didRemoveConcept = (concept) => {
    const newSelection = _.reject(concepts, ['wikidata_id', concept.wikidata_id])
    setConcepts(newSelection)
  }
  const didUpdateTags = (tags) => {
    setTags(tags)
  }

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
    setSaveCount(saveCount + 1)
  }, [concepts, comment, tags])

  const didSave = (!bookmarkState.error && saveCount > 0)

  return (
    <div>
      <div className='page-action'>
        <h3 className='title'>Concepts on this Page</h3>

        <ConceptList concepts={concepts} noAnimation removable onRemove={didRemoveConcept}/>
        <ConceptSuggest lang={resource.lang} onSelect={didAddConcept} usePortal={false}/>

        <h3 className='title'>Personal Hashtags and Notes</h3>

        <HashTagsInput onChange={didUpdateTags} choices={availableTags} value={tags}/>
        <CommentInputContainer>
          <TextArea
            growVertically={true}
            fill
            onChange={e => setComment(e.target.value)}
            placeholder='Add notes about the Resource'
            value={comment}/>
        </CommentInputContainer>
      </div>
      <div>
        <Button text='Delete Resource' icon='trash' loading={deleting} onClick={didDeleteResource}/>
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


const DialogBody = styled.div`
  display: flex;
  align-items: start;


`

export const ResourceEditDialog = (props) => {
  const dialog = useStore($EditDialog)
  const resource = dialog.resource

  return (
    <Dialog
      isOpen={dialog.isOpen}
      onClose={ResourceEditorControl.hide}
      title='Edit Resource'
      icon='edit'
      className='edit-resource'
      usePortal={true}>

      <DialogBody>
        <div className='card'>
          {resource && <ResourceCard url={resource.url} title={resource.title}/>}
        </div>
        <div className='editor'>
          {resource && <EditorForm resource={resource}/>}
        </div>
      </DialogBody>
    </Dialog>
  )
}

