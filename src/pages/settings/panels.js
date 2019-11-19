import React, { useState, useEffect } from 'react'
import * as FiIcon from 'react-icons/fi'
import { IconContext } from 'react-icons'
import { Card, Callout, Intent } from '@blueprintjs/core'
import { FormGroup, InputGroup, Button, AnchorButton, Tag } from '@blueprintjs/core'
import { RadioGroup, HTMLSelect, Radio, Switch, Alignment } from '@blueprintjs/core'
import { Formik, Form, Field } from 'formik'
import { motion } from 'framer-motion'

import { AccountSelector } from '~components/input/settings'
import store from '~mixins/persistence'

import { i18n } from '@ilearn/modules/i18n'


const i18nT = i18n.context('pages.settings.panels')


const RadioLabel = (props) => {
  const icon = <props.icon/>
  return (
    <Radio
      label={<span>{icon} {props.label} </span>}
      value={props.value}
      alignIndicator={Alignment.RIGHT}/>
  )
}

const panelVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1 },
}

const PosedCard = (props) => (
  <motion.div initial='hidden' animate='visible' variants={panelVariants}>
    <Card {...props}/>
  </motion.div>
)

const General = () => {
  const [ lang, setLang ] = useState('en')

  const promptReload = () => {
    window.setTimeout(() => window.location.reload(), 500)
  }

  useEffect(() => {
    store.get('pref.lang').then((value) => {
      if (value) {
        setLang(value)
      }
    })
  }, [])

  return (
    <PosedCard>
      <h1>{i18nT('general.intro.title')}</h1>

      <Formik
        initialValues={{ lang }}
        enableReinitialize
        onSubmit={(values, actions) => {
          store.set('pref.lang', values.lang)
          promptReload()
        }}
        render={(props) => (
          <Form>
            <label htmlFor='lang'>{i18nT('general.form.languageSelect.label')}</label>
            <Field as={HTMLSelect} name='lang'>
              <option value='en'>English</option>
              <option value='fr'>Français (French)</option>
              <option value='zh'>简体中文 (Chinese)</option>
              <option value='hi'>हिन्दी (Hindi)</option>
            </Field>
            <p>{i18nT('general.form.languageSelect.description')}</p>
            <Button
              icon='tick-circle'
              type='submit'
              loading={props.submitCount > 0}>
              {i18nT('general.form.submitButton.label')}
            </Button>
          </Form>
        )}
      />

    </PosedCard>
  )
}

const Account = () => (
  <PosedCard>
    <h1>{i18nT('account.intro.title')}</h1>
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
    <h1>{i18nT('support.intro.title')}</h1>
    <p>{i18nT('support.intro.description')}</p>

    <p>{i18nT('support.tutorial.title')}</p>
    <AnchorButton text={i18nT('support.tutorial.link')} href='/pages/support.html'/>
    <AnchorButton text={i18nT('support.changelog.link')} href='/pages/changelog.html'/>

    <p>Version: 0.0.40</p>
  </PosedCard>
)

export default { General, Account, Privacy, Support }
