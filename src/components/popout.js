import React, { Component } from 'react'
import { List } from 'immutable'

import { Button, Popover, NonIdealState, Tag, MenuItem, FormGroup, Intent } from '@blueprintjs/core'
import { Slider, Overlay, Card, Elevation } from '@blueprintjs/core'
import { MultiSelect } from '@blueprintjs/select'


import { get_concepts } from '~mixins/remote'
import TagSuggest from '~components/input/tag-suggest'
import { getCanonicalUrl } from '~mixins/utils'
import { BasicCard, InteractiveCard } from '~components/cards'
import ConceptsField from '~components/input/concepts'

import './popout.sass'


class ActionCard extends Component {
  constructor (props) {
    super(props)

    this.state = {
      pageUrl: getCanonicalUrl(),
      concepts: List(),
      selected: List(),
      fetched: false,
      inflight: false,
      isOpen: false,
    }
  }

  componentDidMount () {
    browser.runtime.onMessage.addListener((message, sender, respond) => {
      if (message.activate) {
        this.setState({ isOpen: true })
        console.log(message, sender)
      }
    })
  }

  shouldFetchConcepts () {
    if (this.state.fetched) {
      return
    }
    this.setState({ inflight: true })
    RootAPI
      .fetchConcepts(this.state.pageUrl)
      .then((data) => {
        const concepts = List(data.concepts)
        this.setState({
          concepts,
          selected: concepts,
          fetched: true,
          inflight: false,
        })
      })
  }

  shouldPushChanges () {
    this.setState({ inflight: true })
    RootAPI.learn({
      url: this.state.pageUrl,
      concepts: this.state.selected.toJS(),
      username: 'Nuggets',    // [XXX] Fix this to be configurable.
      knowledge_progression: 0.5,
      title: document.title,
    }).then(() => {
      this.setState({ learned: true, inflight: false, errored: false })
    }).fail(() => {
      this.setState({ inflight: false, errored: true })
    })
  }

  shouldUpdateConcept (item) {
    this.setState({ inflight: true })
    RootAPI.crowdSourcing({
      ressource_url: this.state.pageUrl,
      concept_title: item.label,
      reliability_variation: -1,
    }).then(() => {
      this.setState({ inflight: false, errored: false })
    }).fail(() => {
      this.setState({ inflight: false, errored: true })
    })
  }

  render () {
    return (
      <Overlay
        hasBackdrop={false}
        isOpen={this.state.isOpen}
        usePortal={true}
        className='np-ext--card'
        transitionName='np-ext--card-transition'>

        <InteractiveCard>
          <h5>iLearn</h5>
          <ConceptsField />
          <TagSuggest />
        </InteractiveCard>

      </Overlay>

    )
  }
}

export { ActionCard }
