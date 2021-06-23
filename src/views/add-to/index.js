import React from 'react'
import { useStore } from 'effector-react'
import { useAsync, useList } from 'react-use'
import { Dialog, Button, InputGroup, FormGroup, Callout, HTMLSelect, Card } from '@blueprintjs/core'
import { Spinner, ProgressBar, Icon, Tag, Divider, HTMLTable } from '@blueprintjs/core'
import { RiAnchorLine } from 'react-icons/ri'
import PapaParser from 'papaparse'
import { useDropzone } from 'react-dropzone'

import { IngressAPI } from '@ilearn/modules/api'

import { ResourceEditorControl, didSaveEditedResource } from '~components/resources/store'
import { ConceptList } from '~components/concepts'
import { CardBranding } from '~components/cards/resources'
import { GlobalToaster } from '~page-commons/notifications'

import { $AddToDialog, AddToDialogControl } from './store'
import { $AddMultipleDialog, AddMultipleDialogControl } from './store'

import './style.scss'


const processResource = async (url) => {
  let preprocResponse, doc2vecResponse
  preprocResponse = await IngressAPI.preprocess({ link: url })

  if (preprocResponse.error_type !== undefined) {
    throw new Error('Cannot fetch data')
  }
  if (preprocResponse.title === null) {
    throw new Error('No title found')
  }
  doc2vecResponse = await IngressAPI.doc2vec({ link: url, lang: preprocResponse.lang })

  return {
    url,
    title: preprocResponse.title,
    lang: preprocResponse.lang,
    hashtags: [],
    concepts: doc2vecResponse,
  }
}


const NewResourceItemLoadingState = ({ url }) => {
  return (
    <Card className='new-resource-item loading'>
      <div className='pills'>
        <CardBranding url={url}/>
      </div>
      <Spinner size={20}/>
    </Card>
  )
}

const NewResourceItemErrorState = ({ url }) => {
  return (
    <Card className='new-resource-item error'>
      <div className='pills'>
        <CardBranding url={url}/>
      </div>
      <Icon icon='error'/>
    </Card>
  )
}

const NewResourceItemValueState = ({ url, resource }) => {
  const imageUrl = encodeURI(`/meta/resolve/image?url=${resource.url}`)

  const didClickEdit = () => {
    ResourceEditorControl.show({ mode: 'add', resource: resource })
  }

  return (
    <Card className='new-resource-item value' elevation={1}>
      <div className='image'>
        <div style={{ backgroundImage: `url(${imageUrl})`}}/>
      </div>
      <div className='info'>
        <h3>{resource.title}</h3>
        <div className='pills'>
          <CardBranding url={resource.url}/>
        </div>
        <div className='concepts'>
          <ConceptList concepts={resource.concepts} noAnimation lang={resource.lang}/>
        </div>
      </div>
      <div className='actions'>
        <Button icon='edit' text='Edit' onClick={didClickEdit}/>
      </div>
    </Card>
  )
}

const NewResourceItemAwaitedState = ({ url }) => {
  return (
    <Card className='new-resource-item awaited'>
      <div className='pills'>
        <CardBranding url={url}/>
      </div>
    </Card>
  )
}

const NewResourceItem = ({ url, loading, error, value }) => {
  if (loading) {
    return <NewResourceItemLoadingState url={url}/>
  }
  if (error) {
    return <NewResourceItemErrorState url={url}/>
  }
  if (value) {
    return <NewResourceItemValueState url={url} resource={value}/>
  }
  return <NewResourceItemAwaitedState url={url}/>
}


const NewResourcesPool = ({ urls }) => {
  const [ progress, setProgress ] = React.useState(0.05)
  const [ items, itemsMethods ] = useList(urls.map(url => ({
    url: url,
    loading: false,
    error: false,
    value: null,
  })))

  React.useEffect(async () => {
    for (let i = 0; i < items.length; i += 1) {
      const obj = items[i]
      obj.loading = true
      itemsMethods.updateAt(i, obj)

      try {
        obj.value = await processResource(obj.url)
        obj.loading = false
      } catch {
        obj.error = true
        obj.loading = false
      }
      itemsMethods.updateAt(i, obj)
      setProgress((i + 1) / items.length)
    }
  }, [])

  React.useEffect(() => {
    didSaveEditedResource.watch((value) => {
      // Update the list of resources with this value.
      const index = items.findIndex(i => i.value.url === value.url)
      const item = items[index]
      item.value = value
      itemsMethods.updateAt(index, item)
    })
  })

  const didSaveAll = async () => {
    if (progress < 1) {
      return
    }

    setProgress(0.05)
    for (let i = 0; i < items.length; i += 1) {
      const obj = items[i]

      if (obj.value) {
        console.log('will save', obj.value)
        // Make a request to save the resource.

        await fetch(`${env.ngapi_host}/api/users/resource`, {
          method: 'POST',
          body: JSON.stringify(obj.value),
          headers: {
            'Content-Type': 'application/json',
          },
        })
      }
      setProgress((i + 1) / items.length)
    }
    GlobalToaster.show({
      message: `Added ${items.length} resources.`,
      icon: 'tick',
      intent: 'success',
      timeout: 10000,
    })
  }

  return (
    <div className='new-resources-pool'>
      {progress < 1 && <ProgressBar value={progress}/>}
      <div className='items'>
        {items.map(i => <NewResourceItem key={i.url} {...i}/>)}
      </div>
      <div className='actions'>
        <span className='counter'><Tag intent='primary' round>{items.length}</Tag> Resources</span>
        <Button
          text='Save All'
          intent='success'
          onClick={didSaveAll}
          icon='floppy-disk'
          disabled={progress < 1}/>
      </div>
    </div>
  )

}


const AddMultipleDialog = () => {
  const dialog = useStore($AddMultipleDialog)

  return (
    <Dialog
      canOutsideClickClose={false}
      canEscapeKeyClose={false}
      isOpen={dialog.isOpen}
      onClose={AddMultipleDialogControl.hide}
      title={'Resources from CSV File'}
      icon='import'
      className='add-multiple-dialog'>
      <div className='body'>
        {dialog.urls && <NewResourcesPool urls={dialog.urls}/>}
      </div>
    </Dialog>
  )
}

const CsvColumnSelection = ({ columns, onChange, value }) => {
  const [ columnName, setColumnName ] = React.useState('')

  React.useEffect(() => {
    if (value === '') {
      setColumnName('')
    }
  }, [value])

  const didPickColumn = (e) => {
    setColumnName(e.target.value)
    onChange(e.target.value)
  }

  return (
    <div>
      <FormGroup label='Pick the column that corresponds to URLs you want to add.'>
        <HTMLSelect value={columnName} onChange={didPickColumn}>
          <option value='' disabled>Choose Column</option>
          {columns.map(i => <option value={i} key={i}>{i}</option>)}
        </HTMLSelect>
      </FormGroup>
    </div>
  )
}

const CsvPreview = ({ csv }) => {
  const header = Object.keys(csv[0])
  return <div className='csv-preview'>
    <HTMLTable bordered condensed striped>
      <thead>
        <tr>
          {header.map(i => <td key={i}>{i}</td>)}
        </tr>
      </thead>
      <tbody>
        {csv.map((row, ix) =>
          <tr key={ix}>
            {header.map(cell =>
              <td key={cell}>{row[cell]}</td>
            )}
          </tr>
        )}
      </tbody>
    </HTMLTable>
  </div>
}

const CsvPrompt = () => {
  const [ csvData, setCsvData ] = React.useState(null)
  const [ columns, setColumns ] = React.useState(null)
  const [ columnName, setColumnName ] = React.useState('')

  const onDrop = React.useCallback(acceptedFiles => {
    const reader = new FileReader()
    reader.onload = (x) => {
      const { data } = PapaParser.parse(reader.result, {
        delimiter: ',',
        header: true,
        skipEmptyLines: true,
      })

      setCsvData(data)
      setColumnName('')
      setColumns(Object.keys(data[0]))
    }
    reader.readAsText(acceptedFiles[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const didClickNext = () => {
    const columnUrls = csvData.map(i => i[columnName])
    AddToDialogControl.hide()
    AddMultipleDialogControl.show({ urls: columnUrls })
  }

  const canGoNext = (csvData && columnName !== '')

  return <div className='csv-prompt'>
    <Divider/>
    <p>You can also upload a CSV file containing URLs to the resources you wish to add.</p>
    <p><a href='/etc/welearn-add-to-sample.csv'>Click here for an example CSV file.</a></p>
    <div {...getRootProps()} className='dropzone-body'>
      <input {...getInputProps({ accept: '.csv,.txt', multiple: false })} />
      <Callout className='drop-area' intent={isDragActive ? 'primary' : ''} icon='import'>
        <p>{isDragActive ? 'Drop the file here...' : 'Drag and drop CSV file of resources here, or click here.'}</p>
        <Button icon='document-open' text='Upload CSV' small outlined intent='primary'/>
      </Callout>
    </div>
    <Divider/>

    {csvData && <CsvPreview csv={csvData}/>}

    <div className='csv-column'>
      {columns && <CsvColumnSelection columns={columns} value={columnName} onChange={v => setColumnName(v)}/>}
      {canGoNext && <Button text='Next' onClick={didClickNext} intent='primary' icon='arrow-right'/>}
    </div>
  </div>
}


const AddToDialog = () => {
  const dialog = useStore($AddToDialog)
  const [ url, setUrl ] = React.useState('')
  const [ loading, setLoading ] = React.useState(false)
  const [ error, setErrorState ] = React.useState(false)

  const didClickNext = async () => {
    setErrorState(false)
    setLoading(true)
    let resource

    try {
      resource = await processResource(url)
    } catch {
      setErrorState(true)
      setLoading(false)
      return
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
        <CsvPrompt/>
      </div>
    </Dialog>
  )
}


export const AddToButton = () => {
  return <>
    <AddToDialog/>
    <AddMultipleDialog/>
    <Button
      text='Add to WeLearn'
      intent='primary'
      onClick={AddToDialogControl.show}
      icon={<RiAnchorLine/>}/>
  </>
}
