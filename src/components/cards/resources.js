import React from 'react'
import { Card, Elevation } from '@blueprintjs/core'

import { ConceptList } from '~components/concepts'
import { LanguagePill, DateTimePill, UrlPill } from '~components/pills'


export const ResourceCard = (props) => (
  <Card elevation={Elevation.TWO} interactive className='card resource'>
    <h4 className='title'>{props.title}</h4>

    <DateTimePill timestamp={props.recorded_on} lang={props.lang}/>
    <LanguagePill lang={props.lang}/>
    <UrlPill url={props.url} short linked/>

    <ConceptList
      concepts={props.concepts.map((c) => ({
        title: c[`title_${props.lang}`] || c.title_en,
        ...c,
      }))}
      lang={props.lang}
      onRemove={console.log}/>
  </Card>
)
