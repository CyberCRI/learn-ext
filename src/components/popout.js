import React, { Component } from 'react'

import { Button, Popover, NonIdealState, Tag } from '@blueprintjs/core'

import { get_concepts } from './remote'
import './popout.sass'


class Popout extends Component {
  constructor (props) {
    super(props)
    this.state = {
      ...props.value,
      keywords: [],
      concepts: [],
    }
  }

  componentDidMount () {
    get_concepts().then((data) => {
      this.setState(data)
    })
  }

  render () {
    return (
      <div className='ext--root'>
        <Popover>
          <Button icon='book' />
          <div className='ext popover'>
            <div className='tags'>
              {this.state.concepts.map((x) => <Tag key={x.label}>{x.label}</Tag>)}
            </div>
            <NonIdealState icon='code-block' action={<Button icon='refresh'/>} />
          </div>
        </Popover>
      </div>
    )
  }
}

export default Popout
