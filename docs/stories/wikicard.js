import React from 'react'
import { storiesOf } from '@storybook/react'
import { withKnobs, radios } from '@storybook/addon-knobs'

import { WikiCard } from '~components/cards'
import { ResourceCard } from '~components/cards/resources'

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

storiesOf('ResourceCard', module)
  .add('With image and icons', () => {
    const props = {
      url: 'https://en.wikipedia.org/wiki/Tipperne',
      title: 'Tipperne - Wikipedia',
      created_on: '2019-06-13T12:57:34.824694',
      concepts: [],
    }
    return (<ResourceCard {...props}/>)
  })
