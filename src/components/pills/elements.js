import React from 'react'
import moment from 'moment'
import urlParse from 'url-parse'
import clsx from 'classnames'
import { useToggle } from 'react-use'

import OpenGraph from '~mixins/opengraph'


const Pill = (props) => {
  // Pillbox Composer
  const modifiers = clsx('pill', props.className, props.kind, {
    minimal: props.minimal,
    large: props.large,
    interactive: props.interactive,
  })

  return (
    <div role='pill' className={modifiers} style={props.style}>
      { props.children }
    </div>
  )
}

export const LanguagePill = ({ lang, ...props }) => {
  return (
    <Pill kind='language' {...props}>
      <span>{lang}</span>
    </Pill>
  )
}

export const DateTimePill = ({ timestamp, lang='en-gb', ...props }) => {
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

export const UrlPill = ({ url, linked=false, short=false, ...props }) => {
  const uprops = urlParse(url)

  const hostEl = <span className='host'>{uprops.hostname}</span>
  const pathEl = <span className='path'>{uprops.pathname}</span>

  const renderUrl = () => {
    if (linked) {
      // If `linked`, we render anchor element, otherwise just a span.
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

export const FaviconPill = ({ url, title='', ...props }) => {
  const [ reveal, setVisibility ] = useToggle(false)
  const imageDidLoad = () => setVisibility(true)

  return (
    <Pill kind='favicon' {...props}>
      <img
        src={OpenGraph.icon(url)}
        title={title}
        className={reveal ? 'reveal' : 'hidden'}
        role='presentation'
        onLoad={imageDidLoad}/>
    </Pill>
  )
}

export const ResourceLinkPill = (props) => {
  return (
    <div className='pills inline resource-link'>
      <FaviconPill {...props}/>
      <UrlPill {...props}/>
    </div>
  )
}

export const HotKeysPill = ({ keys, ...props }) => {
  return (
    <Pill kind='hotkey' {...props}>
      { keys.map((i) => <kbd key={i}>{i}</kbd>) }
    </Pill>
  )
}
