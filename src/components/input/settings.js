import React, { Component } from 'react'
import { Callout, Intent } from '@blueprintjs/core'
import { InputGroup, ControlGroup, Button, RadioGroup, Radio, FormGroup } from '@blueprintjs/core'
import * as FiIcon from 'react-icons/fi'
import _ from 'lodash'

import { browser } from '~procs/stubs'

import RootAPI, { RuntimeParams } from '~mixins/root-api'
import { userId } from '~mixins/utils'


class AccountSelector extends Component {
  constructor (props) {
    super(props)
    this.state = {
      username: '',
      groupId: '',
      loading: true,
      groups: [],
      status: 0,
    }

    this.didUpdateUserSettings = this.didUpdateUserSettings.bind(this)
    this.didChangeUsername = this.didChangeUsername.bind(this)
    this.didPickGroupId = this.didPickGroupId.bind(this)
  }

  componentDidMount () {
    const loadParams = async () => {
      const user = await RuntimeParams.userInfo()
      const groups = await RuntimeParams.groupStruct()

      return { user, groups }
    }

    loadParams().then((params) => {
      // Filter the default user group
      const { id } = _.find(params.groups, [ 'default', true ])

      this.setState({
        groupId: id,
        loading: false,
        groups: params.groups,
        ...params.user,
      })
    })
  }

  didChangeUsername (e) {
    // Update username input box and reset signedIn state.
    this.setState({ username: e.target.value, signedIn: false })
  }

  didPickGroupId (e) {
    this.setState({ groupId: e.target.value, signedIn: false })
  }

  didUpdateUserSettings (e) {
    // Ensure we don't move to other page.
    e.preventDefault()
    this.setState({ signedIn: false, loading: true })
    if (this.state.username.length >= 2) {
      // For now, we just don't really bother about validation...
      const { username, groupId } = this.state
      RootAPI
        .initializeUser({ email: username, group_id: groupId })
        .then(() => {
          const payload = {
            uid: userId(username),
            username,
            groupId,
            signedIn: true,
          }
          browser.storage.local
            .set({ user: payload })

          this.setState({ loading: false, status: 0, ...payload })
        })
        .fail(() => this.setState({ loading: false, status: -1 }))
    }
  }

  render () {
    const inputIntent = this.state.username.length >= 2 ? Intent.PRIMARY : Intent.DANGER
    return (
      <form onSubmit={this.didUpdateUserSettings}>
        <Callout icon='id-number' title='Account' intent={Intent.DEFAULT}>
          <p>Specify the email you want to use iLearn with.</p>

          {this.state.signedIn && <p>You are signed in!</p>}
          {this.state.status === -1 && <p>Trouble reaching server. Please try again.</p>}

          <FormGroup inline label='Your Email'>
            <InputGroup
              leftIcon='id-number'
              disabled={this.state.loading}
              value={this.state.username}
              intent={inputIntent}
              onChange={this.didChangeUsername}/>
          </FormGroup>

          <RadioGroup
            label='Group'
            inline
            selectedValue={this.state.groupId}
            onChange={this.didPickGroupId}>
            {this.state.groups.map(({ id, label }) =>
              <Radio label={label} value={id} key={id}/>
            )}
          </RadioGroup>

          <Button
            text='Save'
            type='submit'
            intent={inputIntent}
            loading={this.state.loading}
            icon={<FiIcon.FiSave/>}
            onClick={this.didUpdateUserSettings}/>
        </Callout>
      </form>
    )
  }
}

export { AccountSelector }
