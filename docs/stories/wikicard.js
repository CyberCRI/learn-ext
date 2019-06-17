import React from 'react'
import { storiesOf } from '@storybook/react'
import { withKnobs, radios } from '@storybook/addon-knobs'

import { WikiCard } from '~components/cards'

storiesOf('WikiCard', module)
  .addDecorator(withKnobs)
  .add('standard card', () => (
    <WikiCard title='Big Ben'/>
  ))
  .add('language specifiers', () => {
    const lang = radios('Wikipedia Language', {
      English: 'en',
      French: 'fr',
    }, 'en')
    return (<WikiCard title='Big Ben' lang={lang}/>)
  })
