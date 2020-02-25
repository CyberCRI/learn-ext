import React from 'react'
import { storiesOf } from '@storybook/react'

import { PageInfo } from '~components/popover/overlay'


storiesOf('PageInfo', module)
  .add('Standard Page', () => {
    return <PageInfo title='Noop' url='https://noop.pw'/>
  })
