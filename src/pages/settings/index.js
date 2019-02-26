import React, { Component } from 'react'
import { Card, Callout, Divider, Intent, Tabs, Tab, Elevation } from '@blueprintjs/core'
import { FormGroup, InputGroup, Button, Tag } from '@blueprintjs/core'
import { RadioGroup, OverflowList, Radio, Switch, Alignment } from '@blueprintjs/core'
import * as FiIcon from 'react-icons/fi'
import { IconContext } from 'react-icons'
import posed, { PoseGroup } from 'react-pose'

import { AccountSelector } from '~components/input/settings'
import { renderReactComponent } from '~mixins/utils'

import './_settings.sass'


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

const PosedCard = (props) => (
  <PosedPanel initialPose='exit' pose='enter'>
    <Card {...props}/>
  </PosedPanel>
)


const PanelGeneral = () => (
  <PosedCard>
    <Callout icon='asterisk' title='Heads up!'>
      <p>Hey there! This is the general settings panel.</p>
      <p></p>
    </Callout>
  </PosedCard>
)

const PanelAccount = () => (
  <PosedCard>
    <AccountSelector />
  </PosedCard>
)

const PanelPrivacy = () => (
  <PosedCard>
    <Callout icon='shield' title='Privacy' intent={Intent.PRIMARY}>
      <p>Hey there! This is the privacy settings panel.</p>
      <p></p>
    </Callout>

    <h1>Privacy Levels</h1>
    <p>We believe that your data belongs to you and only you.</p>

    <RadioGroup label='Choose what you share' alignIndicator={Alignment.RIGHT}>
      <Radio label={<TabTitle title='Only me' icon={<FiIcon.FiLock/>}/>} alignIndicator={Alignment.RIGHT} value='me'/>
      <Radio label={<TabTitle title='Public' icon={<FiIcon.FiGlobe/>}/>} alignIndicator={Alignment.RIGHT} value='all'/>
    </RadioGroup>

    <h1>Mentorship</h1>
    <Switch label='I want to be contacted by learners who need a mentor with similar skills and interests as me'/>


  </PosedCard>
)

const PanelSupport = () => (
  <PosedCard>
    <Callout icon='help' title='Help and Support' intent={Intent.PRIMARY}>
      <p>Hey there! This is the support settings panel.</p>
      <p></p>
    </Callout>
  </PosedCard>
)

const TabTitle = ({ title, icon }) => (
  <span className='np-tab-title with-icon'>
    {icon}
    {title}
  </span>
)

const SettingsTabs = (props) => {
  return (
    <Tabs large vertical id='pages-settings' className='np-tabs-settings' renderActiveTabPanelOnly>
      <Tab title={<TabTitle title='Account' icon={<FiIcon.FiUser/>}/>} id='account' panel={<PanelAccount/>}/>
      <Tab title={<TabTitle title='General' icon={<FiIcon.FiSettings/>}/>} id='general' panel={<PanelGeneral/>}/>
      <Tab title={<TabTitle title='Privacy' icon={<FiIcon.FiShield/>}/>} id='privacy' panel={<PanelPrivacy/>}/>
      <Divider/>
      <Tab title={<TabTitle title='Support' icon={<FiIcon.FiLifeBuoy/>}/>} id='support' panel={<PanelSupport/>}/>
    </Tabs>
  )
}

const SettingsContainer = (props) => {
  return (
    <div>
      <IconContext.Provider value={{ size: '3em', color: '#fff' }}>
        <div><FiIcon.FiSettings/></div>
      </IconContext.Provider>
      <SettingsTabs />
    </div>
  )
}

document.addEventListener('apploaded', () => {
  renderReactComponent('settings', SettingsContainer)
})
