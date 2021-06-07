import React from 'react'
import { HTMLSelect } from '@blueprintjs/core'

const LANGUAGES = [
  { iso: 'en', label: 'English', icon: '🇬🇧' },
  { iso: 'fr', label: 'French', icon: '🇫🇷' },
  { iso: 'es', label: 'Spanish', icon: '🇪🇸' },
]

export const LanguageSelector = (props) => {
  const [ value, setValue ] = React.useState(props.value)

  React.useEffect(() => {
    if (props.value !== value) {
      setValue(props.value)
    }
  }, [props.value])

  const didChangeValue = (e) => {
    setValue(e.target.value)
    props.onChange(e.target.value)
  }

  return (
    <HTMLSelect value={value} onChange={didChangeValue}>
      {LANGUAGES.map(l =>
        <option key={l.iso} value={l.iso}>{l.icon} {l.label}</option>)}
    </HTMLSelect>
  )
}
