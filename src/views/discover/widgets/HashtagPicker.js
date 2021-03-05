import React from 'react'
import { Divider, Tag } from '@blueprintjs/core'
import { useMount } from 'react-use'
import { useStore } from 'effector-react'

import { i18n } from '@ilearn/modules/i18n'
import { $globalContext } from '~page-commons/store'

import { didPickTag, $currentHashtag, $layerSource } from '../store'
import { CarteSearchAPI } from '@ilearn/modules/api'



export const HashtagPicker = (props) => {
  const node = useStore($globalContext)
  const selectedTag = useStore($currentHashtag)
  const currentLayer = useStore($layerSource)
  const [facets, setFacets] = React.useState({})
  const [loading, setLoading] = React.useState(true)
  let tags = []

  useMount(() => {
    setLoading(true)
    if (node.authorized) {
      CarteSearchAPI.facets()
        .then((facets) => {
          setFacets(facets)
          setLoading(false)
        })
        .catch((error) => {
          setFacets({})
          setLoading(false)
        })
    }
  })

  if (loading || !node.authorized || !currentLayer.showHashtags) {
    return null
  }

  if (currentLayer.group === true) {
    tags = facets.group_hashtags[0].data.map(i => i.value)
  } else {
    tags = facets.user_hashtags[0].data.map(i => i.value)
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
            onClick={() => didPickTag(item)}># {item}</Tag>
        )}
        {!tags.length && <p>Your personal hashtags will appear here.</p>}
      </div>
    </div>
  )
}
