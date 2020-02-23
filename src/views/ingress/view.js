import React, { useRef, useState } from 'react'
import { useList, useToggle, useMount, useAsync, useAsyncFn } from 'react-use'
import { AnchorButton, Button, Callout } from '@blueprintjs/core'
import { motion } from 'framer-motion'
import queryStrings from 'query-string'

import { ConceptList, ConceptListLoadingState } from '~components/concepts'
import { ConceptSuggest } from '~components/concepts/suggest'
import { UrlPill, FaviconPill } from '~components/pills'
import { ResourceCard } from '~components/cards/resources'

import { IngressAPI } from '@ilearn/modules/api'

export const PageInfo = ({ title, url }) => {
  return (
    <div className='page-infobox'>
      <FaviconPill className='favicon' url={url} title={title}/>
      <h3>{title}</h3>
      <UrlPill url={url}/>
    </div>
  )
}

const AddToWeLearn = ({ concepts, token, page }) => {
  const [ saveCount, setSaveCount ] = useState(0)
  const [ bookmarkState, addBookmark ] = useAsyncFn(async () => {
    const payload = {
      title: page.title,
      url: page.url,
      lang: page.language,
      readability_score: 40,
      concepts,
    }
    await fetch(`${env.ngapi_host}/api/users/resource`, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        'X-Extension-Auth': token,
      }})
    setSaveCount(saveCount + 1)
  }, [])
  const didSave = (!bookmarkState.error && saveCount > 0)

  return <>
    <Button
      text={didSave ? 'Added to WeLearn' : 'Add to WeLearn'}
      intent={didSave ? 'success' : 'primary'}
      icon={didSave ? 'tick-circle' : 'map-create'}
      fill large
      onClick={addBookmark}
      loading={bookmarkState.loading}
      className='save-btn'/>
  </>
}

const PageConcepts = ({ page }) => {
  const d2vConcepts = useAsync(async () => {
    return await IngressAPI.doc2vec({ link: page.url, lang: page.language })
  })

  const [ concepts, conceptList ] = useList(d2vConcepts.value)

  return <>
    <div className='page-action'>
      <h3 className='title'>Concepts on this Page</h3>
      <ConceptList concepts={concepts} lang={page.language}/>
      <ConceptSuggest lang={page.language}/>
    </div>
  </>
}

export const Ingress = ({ url, token }) => {
  const linkProps = useAsync(async () => {
    return await IngressAPI.preprocess({ link: url })
  }, [])

  if (linkProps.error) {
    return <p>LINKPROP ERR</p>
  }
  if (linkProps.loading) {
    return <p>LOADING</p>
  }
  console.log(linkProps.value)

  return (
    <div className='ingress'>
      <PageConcepts page={linkProps.value}/>
      <ResourceCard url={linkProps.value.url} title={linkProps.value.title} skipLink/>
    </div>
  )
}
