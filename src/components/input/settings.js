import React, { Component } from 'react'
import { Callout, Intent } from '@blueprintjs/core'
import { InputGroup, ControlGroup, Button } from '@blueprintjs/core'
import * as FiIcon from 'react-icons/fi'

import RootAPI from '~mixins/root-api'
import { userId } from '~mixins/utils'


class AccountSelector extends Component {
  constructor (props) {
    super(props)
    this.state = {
      username: '',
      loading: true,
      status: 0,
    }

    this.didUpdateUserSettings = this.didUpdateUserSettings.bind(this)
  }

  componentDidMount () {
    browser.storage.local
      .get('user')
      .then(({ user }) => {
        if (!user.signedIn) {
          this.setState({
            loading: false,
            signedIn: false,
          })
        } else {
          this.setState({
            loading: false,
            ...user,
          })
        }
      })
  }

  didUpdateUserSettings (e) {
    // Ensure we don't move to other page.
    e.preventDefault()
    if (this.state.username.length >= 2) {
      // For now, we just don't really bother about validation...
      const username = this.state.username
      RootAPI
        .initializeUser({ email: username })
        .then(() => {
          const payload = {
            uid: userId(username),
            username: username,
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

          <ControlGroup >
            <InputGroup
              leftIcon='id-number'
              disabled={this.state.loading}
              value={this.state.username}
              intent={inputIntent}
              onChange={(e) => this.setState({ username: e.target.value })}/>
            <Button
              text='Save'
              type='submit'
              intent={inputIntent}
              loading={this.state.loading}
              icon={<FiIcon.FiSave/>}
              onClick={this.didUpdateUserSettings}/>
          </ControlGroup>
        </Callout>
      </form>
    )
  }
}

export { AccountSelector }
