import React from 'react'
import { FaviconPill, UrlPill } from './elements'

export const PageInfoBox = ({ title, url }) => {
  return (
    <div className='page-infobox'>
      <FaviconPill className='favicon' url={url} title={title}/>
      <h3>{title}</h3>
      <UrlPill url={url}/>
    </div>
  )
}
