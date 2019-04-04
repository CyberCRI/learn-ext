import React from 'react'
import { Tag } from '@blueprintjs/core'


export const ConceptTag = (props) => {
  if (props.onRemove) {
    // This tag is removable, so we gotta pass that prop.
  }

  return (
    <Tag interactive minimal large>
      {props.label}
    </Tag>
  )
}
