import React from 'react'
import moment from 'moment'
import urlParse from 'url-parse'
import clsx from 'classnames'

import './styles.scss'


export const Pill = (props) => {
  // Pillbox Composer
  const modifiers = clsx('pill', props.className, props.kind, {
    minimal: props.minimal,
    large: props.large,
    interactive: props.interactive,
  })

  return (
    <div role='pill' className={modifiers}>
      { props.children }
    </div>
  )
}

export const LanguagePill = (props) => {
  return (
    <Pill kind='language' {...props}>
      <span>{props.lang}</span>
    </Pill>
  )
}

export const DateTimePill = ({ timestamp, lang, ...props }) => {
  const displayTime = moment
    .utc(timestamp)
    .locale(lang)
    .local()
    .calendar()

  return (
    <Pill kind='datetime' {...props}>
      <time dateTime={timestamp}>{displayTime}</time>
    </Pill>
  )
}

export const UrlPill = ({ url, ...props }) => {
  const uprops = urlParse(url)

  // If `linked`, we render anchor element, otherwise just a span.
  const linked = props.linked || false
  const short = props.short || false

  const hostEl = <span className='host'>{uprops.hostname}</span>
  const pathEl = <span className='path'>{uprops.pathname}</span>

  const renderUrl = () => {
    if (linked) {
      return (
        <a href={url} target='_blank' rel='nofollow'>
          { hostEl }
          { !short && pathEl }
        </a>
      )
    } else {
      return (
        <span className='anchor'>
          { hostEl }
          { !short && pathEl }
        </span>
      )
    }
  }

  return (
    <Pill kind='url' {...props}>
      { renderUrl() }
    </Pill>
  )
}


export const HotKeysPill = ({ keys, ...props }) => {
  return (
    <Pill kind='hotkey' {...props}>
      { keys.map((i) => <kbd key={i}>{i}</kbd>) }
    </Pill>
  )
}
