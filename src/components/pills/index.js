import React from 'react'
import moment from 'moment'
import urlParse from 'url-parse'

import './styles.scss'


export const LanguagePill = ({ lang }) => {
  return <div>{lang}</div>
}

export const DateTimePill = ({ timestamp, lang }) => {
  const displayTime = moment
    .utc(timestamp)
    .locale(lang)
    .local()
    .calendar()

  return (
    <time dateTime={timestamp}>
      {displayTime}
    </time>
  )
}

export const UrlPill = ({ url }) => {
  const uprops = urlParse(url)
  return (
    <a href={url} className='pill url'>
      <span className='host'>{uprops.hostname}</span>
      <span className='path'>{uprops.pathname}</span>
    </a>
  )
}
