import React, { useRef, useState } from 'react'
import { useClickAway, useLogger, useToggle, useMount, useUpdateEffect } from 'react-use'
import { Spinner, Card, Button } from '@blueprintjs/core'
import { motion } from 'framer-motion'

import { Port } from '~procs/portal'
import { ConceptList } from '~components/concepts'
import { ConceptSuggest } from '~components/concepts/suggest'
import { UrlPill, FaviconPill } from '~components/pills'

import { RatingPicker, PopoverTools } from '.'
import { request } from '~mixins/request'
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

  if (props.url && props.url !== url) {
    setUrl(props.url)

    request({
      url: `${env.ngapi_host}/meta/preproc`,
      data: {
        url: props.url,
      },
    }).then((data) => {
      setLanguage(data.lang)

      request({
        url: `${env.ngapi_host}/textract/infer/link`,
        data: {
          url: props.url,
          lang: data.lang,
        },
      }).then((data) => {
        setConcepts(data)
        setStatus(200)
      }).fail((err) => {
        console.error(err)
      })
    })
  }

  const shouldLearn = () => {
    const payload = {
      url: url,
      concepts: concepts,
      knowledge_progression: kprog,
    }
    // RootAPI
    //   .learn(payload)
    //   .then((data) => {
    //     setStatus(201)
    //   })
  }

  const shouldClose = () => {
    dispatcher.dispatch({
      context: 'broadcast',
      payload: { action: 'close' },
    })
  }

  browser.storage.local.get('auth_token').then(console.log)



  // Only run when `kprog` or `concepts` updates:
  // useUpdateEffect(shouldLearn, [ concepts, kprog ])
  // useUpdateEffect(shouldClose, [ kprog ])

  const didAddConcept = (item) => {
    const ixTitle = _(concepts).map('wikidata_id').value()
    if (!_.includes(ixTitle, item.wikidata_id)) {
      setConcepts([ ...concepts, item ])
    }
  }
  const didRemoveConcept = (item) => {
    setConcepts(_.reject(concepts, [ 'wikidata_id', item.wikidata_id ]))
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


const popVariants = {
  open: {
    y: 0,
    opacity: 1,
    scaleY: 1,
  },
  closed: {
    y: -50,
    opacity: 0,
    scaleY: .5,
  },
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
      <motion.div
        initial='closed'
        animate={isOpen ? 'open' : 'closed'}
        variants={popVariants}>
        <Card className='page-action'>
          <div>
            <PopoverTools/>
            <PageInfo {...tabInfo}/>
            <PageConcepts {...tabInfo}/>

            <Button text='Save'/>
            <Button text='Cancel'/>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
