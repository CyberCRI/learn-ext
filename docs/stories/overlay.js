import React from 'react'
import { storiesOf } from '@storybook/react'

import { PopOverlay, PageInfo } from '~components/popover/overlay'


storiesOf('PopOverlay', module)
  .add('Standard View', () => {
    return <PopOverlay />
  })

storiesOf('PageInfo', module)
  .add('Standard Page', () => {
    return <PageInfo title='Noop' url='https://noop.pw'/>
  })
