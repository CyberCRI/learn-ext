import React from 'react'
import { Button } from '@blueprintjs/core'
import clsx from 'classnames'


export const RemovableTag = (props) => {
  const tagClasses = clsx('tag', {
    interactive: props.interactive,
    removable: props.removable,
  })

  const didRemove = () => {
    props.onRemove && props.onRemove()
  }

  return (
    <div className={tagClasses}>
      {props.children}
      <Button className='remove' icon='cross' minimal onClick={didRemove}/>
    </div>
  )
}
