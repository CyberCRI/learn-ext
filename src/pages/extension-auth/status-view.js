import React from 'react'
import { AnchorButton, Button, Card } from '@blueprintjs/core'

import { clearStoredToken } from '~procs/token-utils'

export const AuthNewConnection = (props) => {
  return <>
    <Card>
      <h4>Connection!</h4>
      <p>You've succesfully connected the extension with your account.</p>
    </Card>
  </>
}

export const AuthPromptConnection = (props) => {
  return <>
    <Card>
      <h4>Please Connect to WeLearn</h4>

      <AnchorButton href={props.authUrl}>Connect</AnchorButton>
    </Card>
  </>
}

export const AuthStatus = (props) => {
  const didClickDisconnect = () => {
    clearStoredToken().then(() => window.location.reload())
  }
  return <>
    <Card>
      <p>Connected to WeLearn as</p>
      {props.newLogin && <p>Welcome!</p>}
      <pre>{props.token.email}</pre>
      <Button text='Disconnect' onClick={didClickDisconnect}/>
    </Card>
  </>
}


export const AuthStatusView = (props) => {
  console.log(props)
  if (props.urlHasAToken) {
    return <AuthNewConnection {...props}/>
  }
  if (!props.hasToken) {
    // We do not have any token, so we gotta prompt the user for it.
    return <AuthPromptConnection {...props}/>
  }
  return <AuthStatus {...props}/>
}
