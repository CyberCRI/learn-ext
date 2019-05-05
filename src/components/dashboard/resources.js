import React, { Component } from 'react'
import _ from 'lodash'
import { CSSGrid, SpringGrid, measureItems, layout } from 'react-stonecutter'

import RootAPI from '~mixins/root-api'

import { ResourceCard } from '~components/cards/resources'
const Grid = measureItems(SpringGrid)

export class ResourceGrid extends Component {
  constructor (props) {
    super(props)
    this.state = {
      resources: [],
      visible: [],
      pose: 'exit',
    }
  }

  componentDidMount () {
    RootAPI.fetchPortfolio()
      .then((data) => {
        this.setState({
          visible: data.resources.slice(10),
          resources: data.resources,
          pose: 'enter',
        })

        setInterval(() => {
          const visible = _(this.state.resources)
            .sampleSize(10)
            .value()
          this.setState({ visible })
        }, 3000)
      })
  }
  render () {
    return (
      <Grid
        component='ul'
        columns={4}
        columnWidth={250}
        gutterWidth={15}
        gutterHeight={15}
        layout={layout.pinterest}
        enterExitStyle='fromBottom'
        springConfig={{ stiffness: 200, damping: 20 }}
        className='resources'>
        {this.state.visible.map((x, i) =>
          <li key={x.url}>
            <ResourceCard {...x} />
          </li>
        )}
      </Grid>
    )
  }
}
