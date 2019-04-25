import React from 'react'
import _ from 'lodash'
import { useUpdateEffect, useLogger } from 'react-use'
import { ButtonGroup, Button } from '@blueprintjs/core'


const KpRatings = [
  { id: 'alpha', label: 'Easy', value: 0 },
  { id: 'beta', label: 'Standard', value: .5},
  { id: 'gamma', label: 'Difficult', value: 1},
]


export const RatingPicker = (props) => {
  const [ knowledgeProg, setKnowledgeProg ] = React.useState(0.5)

  useUpdateEffect(() => {
    // Publish the state to the parent component.
    props.onChange && props.onChange(knowledgeProg)
  })
  useLogger('RatingPicker', props)

  const buildProps = ({ id, value, label }) => {
    // Returns props for the buttons based on the value specified here.
    return {
      onClick: () => setKnowledgeProg(value),
      active: knowledgeProg === value,
      text: label,
      key: id,
      kind: id,
    }
  }

  return (
    <ButtonGroup fill>
      {KpRatings.map((r) => <Button {...buildProps(r)}/>)}
    </ButtonGroup>
  )
}
