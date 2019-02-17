import React, { Component } from 'react'
import { Callout, Intent, Elevation } from '@blueprintjs/core'
import { FormGroup, InputGroup, ControlGroup, Button } from '@blueprintjs/core'
import * as FiIcon from 'react-icons/fi'

class AccountSelector extends Component {
  constructor (props) {
    super(props)
    this.state = {
      username: '',
      loading: true,
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

  didUpdateUserSettings () {
    if (this.state.username.length >= 2) {
      // For now, we just don't really bother about validation...
      const payload = {
        username: this.state.username,
        signedIn: true,
      }
      browser.storage.local
        .set({ user: payload })
      this.setState({ loading: false, ...payload })
    }
  }

  render () {
    const inputIntent = this.state.username.length >= 2 ? Intent.PRIMARY : Intent.DANGER
    return (
      <div>
        <Callout icon='id-number' title='Account' intent={Intent.DEFAULT}>
          <p>Specify the email you want to use iLearn with.</p>

          {this.state.signedIn && <p>You are signed in!</p>}

          <ControlGroup>
            <InputGroup
              leftIcon='id-number'
              disabled={this.state.loading}
              value={this.state.username}
              intent={inputIntent}
              onChange={(e) => this.setState({ username: e.target.value })}/>
            <Button
              text='Save'
              loading={this.state.loading}
              icon={<FiIcon.FiSave/>}
              onClick={this.didUpdateUserSettings}/>
          </ControlGroup>
        </Callout>
      </div>
    )
  }
}

export { AccountSelector }