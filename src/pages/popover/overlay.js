import React, { useState } from 'react'
import _ from 'lodash'
import { useToggle, useMount, useAsyncRetry, useAsyncFn, useInterval } from 'react-use'
import { AnchorButton, Button, Callout, MenuItem, TextArea } from '@blueprintjs/core'
import { MultiSelect } from '@blueprintjs/select'
import { motion } from 'framer-motion'
import styled from 'styled-components'
import queryStrings from 'query-string'
import { reject, includes } from 'lodash'

import { Port } from '~procs/portal'
import { ConceptList, ConceptListLoadingState } from '~components/concepts'
import { ConceptSuggest } from '~components/concepts/suggest'
import { UrlPill, FaviconPill } from '~components/pills'
import { ResourceCard } from '~components/cards/resources'

import { RatingPicker } from './rating'
import { IngressAPI } from '@ilearn/modules/api'
import { browser } from '~procs/stubs'

import { getStoredToken } from '~procs/token-utils'

const dispatcher = new Port('PopOverlay').connect()

const getAuthApiUrl = () => queryStrings.stringifyUrl({
  url: `${env.ngapi_host}/api/auth/extension`,
  query: {
    callback: browser.runtime.getURL('pages/extension-auth.html'),
  },
})

export const PageInfo = ({ title, url }) => {
  return (
    <div className='page-infobox'>
      <FaviconPill className='favicon' url={url} title={title}/>
      <h3>{title}</h3>
      <UrlPill url={url}/>
    </div>
  )
}

const SignInButton = (props) => {
  return <>
    <AnchorButton
      text='Sign in to add to WeLearn'
      fill large intent='warning'
      href={getAuthApiUrl()}
      target='_blank'
      className='sign-in'/>
    <Callout icon='mountain' className='sign-in-info'>
      Signing in authorizes this extension to add resources to your library.
    </Callout>
  </>
}

const HashTagContainer = styled.div`
  padding: 5px 10px;
`
const CommentInputContainer = styled.div`
  padding: 5px 10px;
`

const HashTagsInput = (props) => {
  const [ query, setQuery ] = useState('')
  const [ selectedTags, setSelectedTags ] = useState([])
  const tags = props.choices || []

  React.useEffect(() => {
    props.onChange(selectedTags)
  }, [selectedTags])

  const itemRenderer = (tag, { modifiers, handleClick }) => {
    if (!modifiers.matchesPredicate) {
      return null
    }
    return (
      <MenuItem
        active={modifiers.active}
        key={tag.id}
        onClick={handleClick}
        text={`${tag.label}`}
        shouldDismissPopover={false}
      />)
  }
  const createNewTagRenderer = (q, active, handleClick) => {
    return <MenuItem
      icon='add'
      text={`Create "${q}"`}
      active={active}
      onClick={handleClick}
      shouldDismissPopover={false}/>
  }
  const createNewItemFromQuery = (query) => {
    return { id: query, label: query }
  }
  const itemPredicate = (query, tag) => {
    return tag.label.indexOf(query) >= 0
  }
  const onTagRemove = (value) => {
    const newSelection = _.reject(selectedTags, ['label', value])
    setSelectedTags(newSelection)
  }
  const onItemSelect = (tag) => {
    const newSelection = _.unionBy(selectedTags, [tag], 'label')
    setSelectedTags(newSelection)
    setQuery('')
  }

  return <HashTagContainer>
    <MultiSelect
      onItemSelect={onItemSelect}
      onQueryChange={q => setQuery(q)}

      itemRenderer={itemRenderer}
      itemPredicate={itemPredicate}
      tagRenderer={tag => `${tag.label}`}

      query={query}
      items={tags.map(i => ({ id: i, label: i }))}
      selectedItems={selectedTags}

      allowCreate={true}
      createNewItemRenderer={createNewTagRenderer}
      createNewItemFromQuery={createNewItemFromQuery}

      fill={true}
      placeholder='Search or Add Hashtags'

      popoverProps={{ minimal: true }}
      tagInputProps={{
        onRemove: onTagRemove,
        tagProps: {
          minimal: true,
          round: true,
          intent: 'primary',
        },
      }}
    />
  </HashTagContainer>
}

const PageConcepts = (props) => {
  const [ url, setUrl ] = useState(props.url)
  const [ concepts, setConcepts ] = useState([])
  const [ tags, setTags ] = useState([])
  const [ availableTags, setAvailableTags ] = useState([])
  const [ comment, setComment ] = useState('')
  const [ kprog, setKProg ] = useState(.5)
  const [ language, setLanguage ] = useState('en')
  const [ status, setStatus ] = useState(100)
  const [ saveCount, setSaveCount ] = useState(0)

  const authn = useAsyncRetry(async () => {
    return await getStoredToken()
  }, [])

  useInterval(() => {
    authn.retry()
    console.log('Retrying to get the token.')
  }, authn.error ? 1000 : null )

  React.useEffect(() => {
    // Do stuff in here after authn is loaded.
    //
    // Load personal hashtags in for initialising list of available tags.
    if (!(authn.error || authn.loading)) {
      fetch(`${env.ngapi_host}/api/users/me/hashtags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Extension-Auth': authn.value.authToken,
        },
      }).then(r => r.json())
        .then(data => setAvailableTags(data))
    }
  }, [authn.value])

  const [ bookmarkState, addBookmark ] = useAsyncFn(async () => {
    const payload = {
      title: props.title,
      url: url,
      lang: language,
      readability_score: 40,
      concepts,
      hashtags: tags.map(t => t.label),
      notes: comment,
    }
    await fetch(`${env.ngapi_host}/api/users/resource`, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        'X-Extension-Auth': authn.value.authToken,
      }})
    setSaveCount(saveCount + 1)
  }, [concepts, language, url, comment, tags, authn])

  const didSave = (!bookmarkState.error && saveCount > 0)

  useMount(() => {
    IngressAPI
      .preprocess({ link: props.url })
      .then((data) => {
        setLanguage(data.lang)

        IngressAPI
          .doc2vec({ link: props.url, lang: data.lang })
          .then((data) => {
            setConcepts(data.map(node => ({ doc2vec: true, ...node })))
            setStatus(200)
          })
      })
  })

  const didAddConcept = (item) => {
    const ixTitle = _(concepts).map('wikidata_id').value()
    if (!includes(ixTitle, item.wikidata_id)) {
      setConcepts([ ...concepts, { ...item, similarity_score: 1, doc2vec: false } ])
    }
  }
  const didRemoveConcept = (item) => {
    setConcepts(reject(concepts, [ 'wikidata_id', item.wikidata_id ]))
  }

  return (
    <div>
      <div className='page-action'>
        <h3 className='title'>Concepts on this Page</h3>

        {status == 100 && <ConceptListLoadingState/>}

        <ConceptList concepts={concepts} removable onRemove={didRemoveConcept}/>
        <ConceptSuggest lang={language} onSelect={didAddConcept}/>
        <h3 className='title'>Personal Hashtags and Notes</h3>
        <HashTagsInput onChange={tags => setTags(tags)} choices={availableTags}/>
        <CommentInputContainer>
          <TextArea
            growVertically={true}
            fill
            onChange={e => setComment(e.target.value)}
            placeholder='Add notes about the Resource'
            value={comment}/>
        </CommentInputContainer>
      </div>


      {(authn.loading || authn.error)
        ? <SignInButton/>
        : <Button
          text={didSave ? 'Added to WeLearn' : 'Add to WeLearn'}
          intent={didSave ? 'success' : 'primary'}
          icon={didSave ? 'tick-circle' : 'map-create'}
          fill large
          onClick={addBookmark}
          loading={bookmarkState.loading}
          className='save-btn'/>}
    </div>
  )
}

export const PopOverlay = (props) => {
  const [ visible, toggle ] = useToggle(false)
  const [ tab, setTab ] = useState()

  const didClose = () => {
    dispatcher.dispatch({ context: 'broadcast', payload: { action: 'close' } })
  }

  const animateState = visible ? 'visible' : 'hidden'

  dispatcher.dispatch({
    context: 'tabState',
    payload: { isOpen: visible },
  })

  useMount(() => {
    try {
      browser.tabs.getCurrent().then((tab) => {
        setTab(tab)
      })
    } catch {}

    dispatcher
      .addAction('open', () => toggle(true))
      .addAction('close', () => toggle(false))
      .addAction('postMount', (msg) => {
        setTab(msg.tabInfo)
      })

    dispatcher.dispatch({ context: 'mounted' })
  })


  return (
    <div className='popoverlay'>
      <motion.div
        className='backdrop'
        initial='hidden'
        animate={animateState}
        transition={{ staggerChildren: .5 }}
        onClick={didClose}
        variants={{
          visible: { opacity: .5 },
          hidden: { opacity: 0 },
        }}/>

      <nav className='toolbar bp3-dark'>
        <img src='/icons/browsers/icon-round-v1.png' title='WeLearn' className='icon'/>
        <Button
          small minimal icon='book'
          text='Dashboard'
          onClick={() => dispatcher.invokeReaction('dashboard')}/>
        <Button
          small minimal icon='settings'
          onClick={() => dispatcher.invokeReaction('settings')}/>
      </nav>

      {tab &&
        <motion.div
          initial='hidden'
          className='container'
          animate={animateState}
          variants={{
            visible: { scale: 1, opacity: 1 },
            hidden: { scale: .8, opacity: 0 },
          }}>
          <div className='page-concepts-root'>
            <div className=''>
              <PageConcepts {...tab}/>
            </div>
          </div>
          <div className='webpage-card'>
            <ResourceCard url={tab.url} title={tab.title} skipLink/>
          </div>
        </motion.div>}
    </div>
  )
}
