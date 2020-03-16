import React from 'react'
import { i18n } from '@ilearn/modules/i18n'

const i18nT = i18n.context('pages.dashboard.resourceLists.states')

export const NoMatches = () => (
  <div className='grid error no-match'>
    <h3>{i18nT('noMatch.title')}</h3>
    <p>{i18nT('noMatch.description')}</p>
  </div>
)

export const NoContent = () => (
  <div className='grid error empty'>
    <h3>{i18nT('empty.title')}</h3>
    <p>{i18nT('empty.description')}</p>
  </div>
)

export const ErrorDescription = () => (
  <div className='resources error server'>
    <h3>{i18nT('error.title')}</h3>
    <p>{i18nT('error.description')}</p>
  </div>
)
