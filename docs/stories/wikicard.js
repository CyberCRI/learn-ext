import React from 'react'
import { storiesOf } from '@storybook/react'
import { withKnobs, radios } from '@storybook/addon-knobs'

import { WikiCard, SkeletonCard } from '~components/cards/wiki-concept'
import { ResourceCard } from '~components/cards/resources'

storiesOf('WikiCard', module)
  .addDecorator(withKnobs)
  .add('skeleton', () => (
    <SkeletonCard />
  ))
  .add('standard card', () => (
    <WikiCard title='Big Ben'/>
  ))
  .add('language specifiers', () => {
    const lang = radios('Wikipedia Language', {
      English: 'en',
      French: 'fr',
      Spanish: 'es',
    }, 'en')
    return (<WikiCard title='Big Ben' lang={lang}/>)
  })

storiesOf('ResourceCard', module)
  .add('With image and icons', () => {
    const props = {
      url: 'https://hackaday.com/2019/06/27/reverse-engineering-cyclic-redundancy-codes/',
      title: 'Reverse Engineering Cyclic Redundancy Codes',
      created_on: '2019-06-13T12:57:34.824694',
      concepts: [
        { title_en: 'Cyclic redundancy check' },
        { title_en: 'Computation of cyclic redundancy checks' },
      ],
    }
    return (<ResourceCard {...props}/>)
  })
