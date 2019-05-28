import React, { useEffect, useRef, useState } from 'react'
import { useClickAway, useLogger, useToggle, usePromise, useAsyncFn, useUpdateEffect } from 'react-use'
import { Spinner } from '@blueprintjs/core'
import pose, { PoseGroup } from 'react-pose'

import { Port } from '~procs/portal'
import { HookedCard } from '~components/cards/cards'
import { ConceptList } from '~components/concepts'
import TagSuggest from '~components/tag-suggest'
import { LanguagePill, UrlPill } from '~components/pills'

import { ConceptSet } from './api-store'

import RootAPI from '~mixins/root-api'
import { RatingPicker, PopoverTools } from '.'


const dispatcher = new Port('PopOverlay')
  .connect()

const CardsBox = pose.div({
  open: { staggerChildren: 200 },
  closed: { staggerChildren: 200 },
})

export const PageInfo = ({ title, favicon, url }) => {
  return (
    <div className='page-infobox'>
      <img className='favicon' src={favicon} title={title}/>
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

  useLogger('PageConcepts', url)

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

  // Only run when `kprog` or `concepts` updates:
  useUpdateEffect(shouldLearn, [ concepts, kprog ])

  const itemSelected = (item) => {
    const ixTitle = _(concepts).map('title').value()
    if (!_.includes(ixTitle, item.title)) {
      RootAPI
        .newConcept({ url, lang: language, title: item.title })
        .then(() => {
          setConcepts([ ...concepts, item ])
        })
    }
  }
  const itemRemoved = (item) => {
    setConcepts(_.reject(concepts, [ 'title', item.title ]))
  }

  return (
    <div className='actions'>
      <h3>Concepts</h3>
      {status === 100 && <Spinner size={Spinner.SIZE_SMALL}/>}

      <ConceptList concepts={concepts} lang={language} removable onRemove={itemRemoved}/>
      <TagSuggest lang={language} onSelect={itemSelected}/>
      <RatingPicker onChange={(value) => setKProg(value)}/>
    </div>
  )
}


export const PopOverlay = (props) => {
  const [ isOpen, toggle ] = useToggle(false)
  const [ tabInfo, setTabInfo ] = useState({})
  const ref = useRef(null)

  useEffect(() => {
    dispatcher
      .addAction('open', (msg) => {
        toggle(true)
        if (tabInfo.url !== msg.tabInfo.url) {
          console.log('Update tabInfo')
          setTabInfo(msg.tabInfo)
        }
      })
      .addAction('close', () => toggle(false))
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
      <CardsBox pose={isOpen ? 'open' : 'closed'}>
        <HookedCard isOpen={isOpen} className='page-action'>
          <div>
            <PopoverTools/>
            <PageInfo {...tabInfo}/>
            <PageConcepts {...tabInfo}/>
          </div>
        </HookedCard>
      </CardsBox>
    </div>
  )
}
