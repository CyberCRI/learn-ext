import React from 'react'
import { storiesOf } from '@storybook/react'

import { PopOverlay } from '~components/popover/overlay'


storiesOf('PopOverlay', module)
  .add('Standard View', () => {
    return <PopOverlay />
  })
