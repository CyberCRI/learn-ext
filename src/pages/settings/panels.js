import React, { useState, useEffect } from 'react'
import * as FiIcon from 'react-icons/fi'
import { IconContext } from 'react-icons'
import { Card, Callout, Intent } from '@blueprintjs/core'
import { FormGroup, InputGroup, Button, Tag } from '@blueprintjs/core'
import { RadioGroup, HTMLSelect, Radio, Switch, Alignment } from '@blueprintjs/core'
import posed from 'react-pose'

import { AccountSelector } from '~components/input/settings'
import { BlogCallout } from '../landing/cards'
import { i18nContext } from '~procs/wrappers'
import store from '~mixins/persistence'


const i18nT = i18nContext('pages.settings.panels')


const PosedPanel = posed.div({
  enter: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: 'tween' },
      default: { duration: 100 },
    },
    delay: 150,
  },
  exit: {
    x: -10,
    opacity: 0,
    transition: {
      duration: 100,
    },
  },
})

const RadioLabel = (props) => {
  const icon = <props.icon/>
  return (
    <Radio
      label={<span>{icon} {props.label} </span>}
      value={props.value}
      alignIndicator={Alignment.RIGHT}/>
  )
}


const PosedCard = (props) => (
  <PosedPanel initialPose='exit' pose='enter'>
    <Card {...props}/>
  </PosedPanel>
)


const General = () => {
  const [ lang, setLang ] = useState('en')

  useEffect(() => {
    store.get('pref.lang').then((value) => {
      if (value) {
        setLang(value)
      }
    })
  }, [])

  const didChooseLang = (e) => {
    const value = e.currentTarget.value
    store.set('pref.lang', value)
    setLang(value)
  }

  return (
    <PosedCard>
      <h1>{i18nT('general.intro.title')}</h1>

      <FormGroup label={i18nT('general.form.languageSelect.label')} inline>
        <HTMLSelect onChange={didChooseLang} value={lang}>
          <option default value='en'>English</option>
          <option value='fr'>Francais</option>
          <option value='hi'>हिंदी (Hindi)</option>
        </HTMLSelect>
      </FormGroup>

      <FormGroup label={i18nT('general.form.themeSelect.label')} inline>
        <RadioGroup label={i18nT('general.form.themeSelect.fields.appearance.label')} alignIndicator={Alignment.RIGHT}>
          <RadioLabel label='Dark' icon={FiIcon.FiGlobe} value='dark'/>
          <RadioLabel label='Light' icon={FiIcon.FiGlobe} value='light'/>
          <RadioLabel label='Browser' icon={FiIcon.FiGlobe} value='Browser'/>
        </RadioGroup>
      </FormGroup>

    </PosedCard>
  )
}

const Account = () => (
  <PosedCard>
    <AccountSelector />
  </PosedCard>
)

const Privacy = () => (
  <PosedCard>
    <h1>{i18nT('privacy.title')}</h1>
    <p>{i18nT('privacy.description')}</p>

    <RadioGroup
      label={i18nT('privacy.sharing.title')}
      alignIndicator={Alignment.RIGHT}>
      <RadioLabel
        label={i18nT('privacy.sharing.choices.private.title')}
        icon={FiIcon.FiLock}
        value='me'/>
      <RadioLabel
        label={i18nT('privacy.sharing.choices.public.title')}
        icon={FiIcon.FiGlobe}
        value='all'/>
    </RadioGroup>

    <h1>{i18nT('privacy.mentorship.title')}</h1>
    <Switch label={i18nT('privacy.mentorship.description')}/>
  </PosedCard>
)

const Support = () => (
  <PosedCard>
    <BlogCallout/>
  </PosedCard>
)

export default { General, Account, Privacy, Support }
