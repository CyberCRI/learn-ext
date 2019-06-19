import React from 'react'
import { storiesOf } from '@storybook/react'
import { withKnobs, radios } from '@storybook/addon-knobs'

import * as Pill from '~components/pills'

storiesOf('Pills', module)
  .addDecorator(withKnobs)
  .add('link with icon', () => (
    <Pill.ResourceLinkPill title='Boop' url='https://placet.noop.pw' linked short/>
  ))

