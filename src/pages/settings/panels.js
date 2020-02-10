import React, { useState, useEffect } from 'react'
import * as FiIcon from 'react-icons/fi'
import { Card, Callout, Intent, Spinner } from '@blueprintjs/core'
import { FormGroup, InputGroup, Button, AnchorButton, Tag } from '@blueprintjs/core'
import { RadioGroup, HTMLSelect, Radio, Switch, Alignment } from '@blueprintjs/core'
import { Select } from "@blueprintjs/select";
import { Formik, Form, Field } from 'formik'
import { motion } from 'framer-motion'

import { request } from '~mixins/request'
import store from '~mixins/persistence'
import { ConnectExtensionPrompt } from '~components/cards/auth'

import { ServiceAPI } from '@ilearn/modules/api'
import { i18n } from '@ilearn/modules/i18n'


const i18nT = i18n.context('pages.settings.panels')


const RadioLabel = (props) => {
  const icon = <props.icon/>
  return (
    <Radio
      label={<span>{icon} {props.label} </span>}
      value={props.value}/>
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
  const [ autoOpenChangelog, setAutoOpenchangelog ] = useState(true)

  const promptReload = () => {
    window.setTimeout(() => window.location.reload(), 500)
  }

  useEffect(() => {
    // async effects end up returning a promise, while here I just want to do
    // use await syntax, so an iife is the way to go:
    (async () => {
      setLang(await store.get('pref.lang', 'en'))
      setAutoOpenchangelog(await store.get('pref.autoShowChangelog', true))
    })()
  }, [])

  return (
    <PosedCard>
      <h1>{i18nT('general.intro.title')}</h1>

      <Formik
        initialValues={{ lang, autoOpenChangelog }}
        enableReinitialize
        onSubmit={(values, actions) => {
          store.set('pref.lang', values.lang)
          store.set('pref.autoShowChangelog', values.autoOpenChangelog)
          promptReload()
        }}>{(props) => (
          <Form>
            <FormGroup
              helperText={i18nT('general.form.languageSelect.description')}
              label={i18nT('general.form.languageSelect.label')}
              labelFor='lang'>
              <Field as={HTMLSelect} name='lang'>
                <option value='en'>English</option>
                <option value='fr'>Français (French)</option>
                <option value='zh'>简体中文 (Chinese)</option>
                <option value='hi'>हिन्दी (Hindi)</option>
              </Field>
            </FormGroup>

            <FormGroup
              label='Extension Preferences'>
              <Field name='autoOpenChangelog'>{({ field }) => (
                <Switch
                  label='Automatically open Changelog when Extension Updates.'
                  checked={field.value}
                  {...field}/>
              )}</Field>
            </FormGroup>

            <Button
              icon='tick-circle'
              type='submit'
              loading={props.submitCount > 0}>
              {i18nT('general.form.submitButton.label')}
            </Button>
          </Form>
      )}</Formik>
    </PosedCard>
  )
}

const Account = () => {
  const [group, setGroup] = React.useState({})
  const [groups, setGroups] = React.useState([])
  const [status, setStatus] = React.useState(0)

  React.useEffect(() => {
    if (window.jstate.user.groups.length > 0) {
      // groupid
      setGroup(window.jstate.user.groups[0].guid)
    }
    ServiceAPI
      .groupList()
      .then(({ results }) => {
        setGroups(results)
        setStatus(1)
      })
      .catch((err) => {
        setStatus(-1)
      })
  }, [])

  const handleChanges = () => {
    setStatus(0)
    ServiceAPI
      .setUserGroup({ guid: group })
      .then(() => {
        setStatus(1)
      })
      .catch((err) => {
        setStatus(-1)
        console.error(err)
      })
  }

  return <>
    <PosedCard>
      <h1>{i18nT('account.intro.title')}</h1>
      <p>You're logged in as <code>{window.jstate.user.email}</code>.</p>

      <FormGroup
        helperText='Choose your group'
        label='Group'>
        <RadioGroup
          inline
          selectedValue={group}
          onChange={(e) => setGroup(e.currentTarget.value)}>
          {groups.map((i) => (
            <Radio
              key={i.guid}
              label={i.label}
              value={i.guid}/>
          ))}
        </RadioGroup>
      </FormGroup>

      <Button
        icon='tick-circle'
        type='submit'
        loading={status == 0}
        onClick={handleChanges}>
        {i18nT('general.form.submitButton.label')}
      </Button>

      <FormGroup>
        <img src='/media/logos/learning-planet.png' height='36px'/>
        <AnchorButton text='Log Out' href={window.jstate.urls.logout} icon='log-out'/>
      </FormGroup>
    </PosedCard>
  </>
}

const Privacy = () => (
  <PosedCard>
    <h1>{i18nT('privacy.title')}</h1>
    <p>{i18nT('privacy.description')}</p>

    <FormGroup
      label={i18nT('privacy.sharing.title')}>
      <RadioGroup disabled>
        <RadioLabel
          label={i18nT('privacy.sharing.choices.private.title')}
          icon={FiIcon.FiLock}
          value='me'/>
        <RadioLabel
          label={i18nT('privacy.sharing.choices.public.title')}
          icon={FiIcon.FiGlobe}
          value='all'/>
      </RadioGroup>
    </FormGroup>

    <FormGroup
      label={i18nT('privacy.mentorship.title')}>
      <Switch label={i18nT('privacy.mentorship.description')}/>
    </FormGroup>
  </PosedCard>
)

const Support = () => (
  <PosedCard>
    <h1>{i18nT('support.intro.title')}</h1>
    <p>{i18nT('support.intro.description')}</p>

    <p>{i18nT('support.tutorial.title')}</p>
    <AnchorButton text={i18nT('support.tutorial.link')} href='/pages/support.html'/>
    <AnchorButton text={i18nT('support.changelog.link')} href='/pages/changelog.html'/>

    <p>Version: <code>{env.info_version}</code></p>
  </PosedCard>
)

const Extension = () => (
  <PosedCard>
    <h1>Browser Extension</h1>
    <p>Here you can connect your browser extension or other channels</p>

    <ConnectExtensionPrompt/>
  </PosedCard>
)

export default { General, Account, Privacy, Support, Extension }
