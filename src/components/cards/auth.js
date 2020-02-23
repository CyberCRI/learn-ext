import React from 'react'

import { Button, Card } from '@blueprintjs/core'


export const ConnectExtensionPrompt = () => {
  const didClickButton = () => console.log('boop!')
  return <>
    <Card>
      <h3>Connect a Browser Extension</h3>
      <p>This will authorize this Extension to add resources to your library.</p>
      <p>If you do not have a user account, you can register for one there.</p>
      <Button icon='flow-linear' onClick={didClickButton} intent='primary'>Connect</Button>
    </Card>
  </>
}
