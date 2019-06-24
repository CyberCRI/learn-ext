import React from 'react'
import * as FiIcon from 'react-icons/fi'
import { IconContext } from 'react-icons'
import { Card, Callout, Intent } from '@blueprintjs/core'
import { FormGroup, InputGroup, Button, Tag } from '@blueprintjs/core'
import { RadioGroup, HTMLSelect, Radio, Switch, Alignment } from '@blueprintjs/core'
import posed from 'react-pose'

import { AccountSelector } from '~components/input/settings'
import { BlogCallout } from '../landing/cards'
import { i18n } from '~procs/wrappers'


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


const General = () => (
  <PosedCard>
    <h1>Preferences</h1>

    <FormGroup label='Language' inline>
      <HTMLSelect>
        <option default value='en'>English</option>
        <option value='fr'>Francais</option>
      </HTMLSelect>
    </FormGroup>

    <FormGroup label='Display' inline>
      <RadioGroup label='Appearance' alignIndicator={Alignment.RIGHT}>
        <RadioLabel label='Dark' icon={FiIcon.FiGlobe} value='dark'/>
        <RadioLabel label='Light' icon={FiIcon.FiGlobe} value='light'/>
        <RadioLabel label='Browser' icon={FiIcon.FiGlobe} value='Browser'/>
      </RadioGroup>
    </FormGroup>

  </PosedCard>
)

const Account = () => (
  <PosedCard>
    <AccountSelector />
  </PosedCard>
)

const Privacy = () => (
  <PosedCard>
    <h1>{i18n('pages.settings.panels.privacy.title')}</h1>
    <p>{i18n('pages.settings.panels.privacy.description')}</p>

    <RadioGroup
      label={i18n('pages.settings.panels.privacy.sharing.title')}
      alignIndicator={Alignment.RIGHT}>
      <RadioLabel
        label={i18n('pages.settings.panels.privacy.sharing.choices.private.title')}
        icon={FiIcon.FiLock}
        value='me'/>
      <RadioLabel
        label={i18n('pages.settings.panels.privacy.sharing.choices.public.title')}
        icon={FiIcon.FiGlobe}
        value='all'/>
    </RadioGroup>

    <h1>{i18n('pages.settings.panels.privacy.mentorship.title')}</h1>
    <Switch label={i18n('pages.settings.panels.privacy.mentorship.description')}/>
  </PosedCard>
)

const Support = () => (
  <PosedCard>
    <BlogCallout/>
  </PosedCard>
)

export default { General, Account, Privacy, Support }
