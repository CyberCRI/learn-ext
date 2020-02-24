import React, { useState } from 'react'
import { useToggle, useMount, useAsync, useAsyncFn } from 'react-use'
import { AnchorButton, Button, Callout } from '@blueprintjs/core'
import { motion } from 'framer-motion'
import queryStrings from 'query-string'

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

const SignInButton = (props) => (
  <>
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
)

const PageConcepts = (props) => {
  const [ url, setUrl ] = useState(props.url)
  const [ concepts, setConcepts ] = useState([])
  const [ kprog, setKProg ] = useState(.5)
  const [ language, setLanguage ] = useState('en')
  const [ status, setStatus ] = useState(100)
  const [ saveCount, setSaveCount ] = useState(0)

  const authn = useAsync(async () => {
    return await getStoredToken()
  }, [])

  const [ bookmarkState, addBookmark ] = useAsyncFn(async () => {
    const payload = {
      title: props.title,
      url: url,
      lang: language,
      readability_score: 40,
      concepts,
    }
    await fetch(`${env.ngapi_host}/api/users/resource`, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        'X-Extension-Auth': authn.value.authToken,
      }})
    setSaveCount(saveCount + 1)
  }, [concepts, language, url, authn])

  const didSave = (!bookmarkState.error && saveCount > 0)

  useMount(() => {
    IngressAPI
      .preprocess({ link: props.url })
      .then((data) => {
        setLanguage(data.lang)

        IngressAPI
          .doc2vec({ link: props.url, lang: data.lang })
          .then((data) => {
            setConcepts(data)
            setStatus(200)
          })
      })
  })

  const didAddConcept = (item) => {
    const ixTitle = _(concepts).map('wikidata_id').value()
    if (!_.includes(ixTitle, item.wikidata_id)) {
      setConcepts([ ...concepts, { ...item, similarity_score: 1 } ])
    }
  }
  const didRemoveConcept = (item) => {
    setConcepts(_.reject(concepts, [ 'wikidata_id', item.wikidata_id ]))
  }

  return (
    <div>
      <div className='page-action'>
        <h3 className='title'>Concepts on this Page</h3>

        {status == 100 && <ConceptListLoadingState/>}

        <ConceptList concepts={concepts} lang={language} removable onRemove={didRemoveConcept}/>
        <ConceptSuggest lang={language} onSelect={didAddConcept}/>
        <RatingPicker rating={kprog} onChange={(value) => setKProg(value)}/>
      </div>

      {authn.error
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
