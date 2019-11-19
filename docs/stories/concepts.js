import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'

import { ConceptSuggest, ConceptList } from '~components/concepts'
import { RemovableTag } from '~components/concepts/tag'


storiesOf('ConceptSuggest', module)
  .add('Standard Choices', () => {
    return <ConceptSuggest onSelect={action('SelectedConcept')}/>
  })


storiesOf('Tags', module)
  .add('Standard', () => {
    return <RemovableTag>Boop!</RemovableTag>
  })
  .add('Interactive', () => {
    return <RemovableTag interactive>Hover and focus over me!</RemovableTag>
  })
  .add('Removable', () => {
    return <RemovableTag removable onRemove={action('Remove')}>Try to remove me</RemovableTag>
  })


storiesOf('ConceptList', module)
  .add('Static List', () => {
    const dataset = [
      { title: 'Cyclic redundancy check' },
      { title: 'Computation of cyclic redundancy checks' },
    ]

    return <ConceptList lang='en' concepts={dataset}/>
  })
  .add('Removable List', () => {
    let dataset = [
      { title: 'Nyan Cat' },
      { title: 'Meme' },
    ]

    return <ConceptList lang='en' concepts={dataset} removable onRemove={action('Remove')}/>
  })
