import React, { useEffect, useRef, useState } from 'react'
import { useClickAway, useLogger, useToggle, useMount, useAsyncFn, useUpdateEffect } from 'react-use'
import { Spinner } from '@blueprintjs/core'

import { Port } from '~procs/portal'
import { HookedCard } from '~components/cards/cards'
import { ConceptList } from '~components/concepts'
import { ConceptSuggest } from '~components/concepts/suggest'
import { LanguagePill, UrlPill, FaviconPill } from '~components/pills'

import RootAPI from '~mixins/root-api'
import OpenGraph from '~mixins/opengraph'
import { RatingPicker, PopoverTools } from '.'


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

  if (props.url && props.url !== url) {
    setUrl(props.url)
    RootAPI
      .fetchConcepts(props.url)
      .then((data) => {
        setLanguage(data.lang)
        setConcepts(data.concepts)
        setStatus(200)
      })
      .fail((data) => {
        setStatus(500)
      })
  }

  const shouldLearn = () => {
    const payload = {
      url: url,
      concepts: concepts,
      knowledge_progression: kprog,
    }
    RootAPI
      .learn(payload)
      .then((data) => {
        setStatus(201)
      })
  }

  const shouldClose = () => {
    dispatcher.dispatch({
      context: 'broadcast',
      payload: { action: 'close' },
    })
  }

  // Only run when `kprog` or `concepts` updates:
  useUpdateEffect(shouldLearn, [ concepts, kprog ])
  useUpdateEffect(shouldClose, [ kprog ])

  const didAddConcept = (item) => {
    const ixTitle = _(concepts).map('title').value()
    if (!_.includes(ixTitle, item.title)) {
      RootAPI
        .newConcept({ url, lang: language, title: item.title })
        .then((data) => {
          // API Response returns the standard concept struct.
          setConcepts([ ...concepts, data ])
        })
    }
  }
  const didRemoveConcept = (item) => {
    const payload = {
      url,
      title: item.title,
      lang: language,
    }
    RootAPI
      .removeConcept(payload)
      .then((data) => {
        setConcepts(_.reject(concepts, [ 'title', item.title ]))
      })
  }
  const didPickRating = (value) => {
    setKProg(value)
    // Close the popover after updating the KProg
    shouldClose()
  }

  return (
    <div className='actions'>
      <h3>Concepts</h3>
      {status === 100 && <Spinner size={Spinner.SIZE_SMALL}/>}
      {status === 500 && <p> </p>}

      <ConceptList concepts={concepts} lang={language} removable onRemove={didRemoveConcept}/>
      <ConceptSuggest lang={language} onSelect={didAddConcept}/>
      <RatingPicker rating={kprog} onChange={didPickRating}/>
    </div>
  )
}


export const PopOverlay = (props) => {
  const [ isOpen, toggle ] = useToggle(false)
  const [ tabInfo, setTabInfo ] = useState({})
  const ref = useRef(null)

  dispatcher.dispatch({
    context: 'tabState',
    payload: { isOpen },
  })

  useMount(() => {
    dispatcher
      .addAction('open', () => toggle(true))
      .addAction('close', () => toggle(false))
      .addAction('postMount', (msg) => {
        setTabInfo(msg.tabInfo)
      })

    dispatcher.dispatch({ context: 'mounted' })
  })
  useLogger('PopOverlay')

  useClickAway(ref, (event) => {
    if (event.target.nodeName !== 'BODY') {
      return
    }
    dispatcher.dispatch({
      context: 'broadcast',
      payload: { action: 'close' },
    })
  })

  return (
    <div className='popoverlay' ref={ref}>
      <HookedCard isOpen={isOpen} className='page-action'>
        <div>
          <PopoverTools/>
          <PageInfo {...tabInfo}/>
          <PageConcepts {...tabInfo}/>
        </div>
      </HookedCard>
    </div>
  )
}
