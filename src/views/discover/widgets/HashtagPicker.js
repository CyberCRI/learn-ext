import React from 'react'
import { Divider, Tag } from '@blueprintjs/core'
import { useMount } from 'react-use'
import { useStore } from 'effector-react'

import { i18n } from '@ilearn/modules/i18n'
import { $globalContext } from '~page-commons/store'

import { didPickTag } from '../store'
import { CarteSearchAPI } from '@ilearn/modules/api'



export const HashtagPicker = (props) => {
  const node = useStore($globalContext)
  const [tags, setTags] = React.useState([])
  const [selectedTag, setSelectedTag] = React.useState('')

  const didClickOnTag = (tag) => {
    setSelectedTag(tag)
    didPickTag(tag)
  }

  useMount(() => {
    if (node.authorized) {
      CarteSearchAPI.hashtagList()
        .then((hashtags) => {
          setTags(hashtags)
        })
    }
  })

  if (!node.authorized) {
    return null
  }

  return (
    <div className='widget hashtags'>
      <h5>#Hashtags</h5>
      <Divider/>
      <div className='tags'>
        {tags.map(item =>
          <Tag round minimal interactive
            className='hashtag'
            key={item}
            intent={item === selectedTag ? 'primary' : null}
            onClick={() => didClickOnTag(item)}># {item}</Tag>
        )}
      </div>
    </div>
  )
}
