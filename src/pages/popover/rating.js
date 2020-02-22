import React from 'react'
import { ButtonGroup, Button } from '@blueprintjs/core'


const KpRatings = [
  { id: 'alpha', label: 'Easy', value: 0 },
  { id: 'beta', label: 'Standard', value: .5},
  { id: 'gamma', label: 'Difficult', value: 1},
]


export const RatingPicker = ({ rating, onChange, ...props }) => {
  // Stateless Rating Picker. Uses the KpRating values to render buttons.

  const buildProps = ({ id, value, label }) => {
    // Return props for the buttons defined in object above.
    return {
      onClick: () => onChange(value),
      active: rating === value,
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
