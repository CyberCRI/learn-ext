import React, { useRef, useState } from 'react'
import { useClickAway, useToggle, useMount } from 'react-use'
import { Button } from '@blueprintjs/core'
import { motion } from 'framer-motion'

import { Port } from '~procs/portal'
import { ConceptList, ConceptListLoadingState } from '~components/concepts'
import { ConceptSuggest } from '~components/concepts/suggest'
import { UrlPill, FaviconPill } from '~components/pills'
import { ResourceCard } from '~components/cards/resources'

import { RatingPicker } from './rating'
import { IngressAPI } from '@ilearn/modules/api'
import { browser } from '~procs/stubs'


const dispatcher = new Port('PopOverlay').connect()


export const PageInfo = ({ title, url }) => {
  return (
    <div className='page-infobox'>
      <FaviconPill className='favicon' url={url} title={title}/>
      <h3>{title}</h3>
      <UrlPill url={url}/>
    </div>
  )
}

const PageConcepts = (props) => {
  const [ url, setUrl ] = useState(props.url)
  const [ concepts, setConcepts ] = useState([])
  const [ kprog, setKProg ] = useState(.5)
  const [ language, setLanguage ] = useState('en')
  const [ status, setStatus ] = useState(100)
  const [ token, setToken ] = useState()

  const [ isSaving, setIsSaving ] = useState(false)

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
          .fail((err) => {
            console.error(err)
          })
      })
    browser.storage.local
      .get('auth_token')
      .then(({ auth_token }) => setToken(auth_token))
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
  const didPickRating = (value) => {
    setKProg(value)
  }
  const didClickSave = () => {
    const payload = {
      title: props.title,
      url: url,
      lang: language,
      readability_score: 40,
      concepts,
    }
    setIsSaving(true)

    fetch(`${env.ngapi_host}/api/users/resource`, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        'X-Extension-Auth': token,
      }})
      .then(() => {
        setIsSaving(false)
      })
      .fail(() => {
        console.error(":(")
      })
  }

  return (
    <div>
      <div className='page-action'>
        <h3 className='title'>Concepts on this Page</h3>

        {status == 100 && <ConceptListLoadingState/>}

        <ConceptList concepts={concepts} lang={language} removable onRemove={didRemoveConcept}/>
        <ConceptSuggest lang={language} onSelect={didAddConcept}/>
        <RatingPicker rating={kprog} onChange={didPickRating}/>
      </div>
      <Button text='Add to WeLearn' fill intent='primary' large onClick={didClickSave} loading={isSaving} className='save-btn'/>
    </div>
  )
}

export const PopOverlay = (props) => {
  const [ visible, toggle ] = useToggle(false)
  const [ tab, setTab ] = useState()
  const ref = useRef(null)

  useClickAway(ref, () => {
    dispatcher.dispatch({ context: 'broadcast', payload: { action: 'close' } })
  })

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
          small minimal icon='log-in'
          text='Connect'
          onClick={() => dispatcher.invokeReaction('settings')}/>
      </nav>

      {tab &&
        <motion.div
          initial='hidden'
          className='container'
          animate={animateState}
          ref={ref}
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
