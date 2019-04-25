import React from 'react'
import { Card, Elevation } from '@blueprintjs/core'

import { ConceptList } from '~components/concepts'


export const ResourceCard = (props) => (
  <Card elevation={Elevation.TWO} interactive>
    <h4 className='title'>{props.title}</h4>
    <time dateTime={props.recorded}>{props.recorded}</time>
    <ConceptList concepts={props.concepts} onRemove={console.log}/>
  </Card>
)
