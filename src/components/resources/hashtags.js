import React from 'react'
import styled from 'styled-components'

import { Tag } from '@blueprintjs/core'

import { didClickOnHashTag } from './store'

const HashTagList = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;

  & > li {
    padding: 2px;
    margin-right: 5px;
  }
`

export const HashTags = ({ tags }) => {
  return <HashTagList className='hashtags'>
    {tags.map(tag =>
      <li key={tag}>
        <Tag minimal round interactive
          onClick={() => didClickOnHashTag(tag)}
          intent='primary'>
          # {tag}
        </Tag>
      </li>
    )}
  </HashTagList>
}
