import React from 'react'
import { useMount, useAsyncFn } from 'react-use'
import { Card, Elevation } from '@blueprintjs/core'
import _ from 'lodash'

import { request } from '~mixins/request'
import { ConceptList } from '~components/concepts'
import { LanguagePill, DateTimePill, UrlPill } from '~components/pills'


export const ResourceCard = (props) => {
  const [ ogMeta, fetchOgMeta ] = useAsyncFn(async () => {
    return await request({
      url: 'https://opt.ilearn.cri-paris.org/og/meta',
      method: 'get',
      data: {
        url: props.url,
      },
    })
  })
  const imgUrl = _.get(ogMeta, 'value.image')

  useMount(() => {
    // Fetch metadata on mount.
    fetchOgMeta()
  })

  return (
    <Card elevation={Elevation.TWO} interactive className='card resource'>
      <h4 className='title'>{props.title}</h4>

      <div className='backdrop'>
        <img src={imgUrl} className='backdrop'/>
        <img src={imgUrl} className='visible'/>
      </div>

      <DateTimePill timestamp={props.recorded_on} lang={props.lang}/>
      <LanguagePill lang={props.lang}/>

      <ConceptList
        concepts={props.concepts.map((c) => ({
          title: c[`title_${props.lang}`] || c.title_en,
          ...c,
        }))}
        lang={props.lang}/>
      <UrlPill url={props.url} short linked/>
    </Card>
  )
}
