import React from 'react'
import { i18n } from '@ilearn/modules/i18n'

export const NoMatches = () => {
  const i18nT = i18n.context('pages.dashboard.resourceLists.states.noMatch')
  return (
    <div className='grid error no-match'>
      <h3>{i18nT('title')}</h3>
      <p>{i18nT('description')}</p>
    </div>
  )
}

export const NoContent = () => {
  const i18nT = i18n.context('pages.dashboard.resourceLists.states.empty')
  return <>
    <div className='grid error empty'>
      <h3>{i18nT('title')}</h3>
      <p>{i18nT('description')}</p>
    </div>
  </>
}

export const ErrorDescription = (props) => {
  const i18nT = i18n.context('pages.dashboard.resourceLists.states.error')
  return (
    <div className='resources error server'>
      <h3>{i18nT('title')}</h3>
      <p>{i18nT('description')}</p>
    </div>
  )
}
