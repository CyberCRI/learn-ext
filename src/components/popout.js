import React, { Component } from 'react'
import { List } from 'immutable'

import { Button, ButtonGroup, Popover, FormGroup, Intent } from '@blueprintjs/core'
import { Spinner, ProgressBar } from '@blueprintjs/core'

import RootAPI from '~mixins/root-api'
import { getCanonicalUrl } from '~mixins/utils'
import TagSuggest from '~components/tag-suggest'
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

    this.didAddConcept = this.didAddConcept.bind(this)
    this.didRemoveConcept = this.didRemoveConcept.bind(this)
  }

  componentDidMount () {
    browser.runtime.onMessage.addListener((message, sender, respond) => {
      if (message.activate) {
        this.setState({ isOpen: !this.state.isOpen }, this.shouldFetchConcepts())
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

  didAddConcept (item) {
    const selected = this.state.selected.push(item)
    this.setState({ selected })
  }

  didRemoveConcept (item, selected) {
    this.setState({ selected }, this.shouldPushChanges)
  }

  render () {
    return (
      <div className='card-container'>
        <InteractiveCard isOpen={this.state.isOpen && !this.state.fetched} className='np-basic-card'>
          <div><Spinner/></div>
        </InteractiveCard>

        <InteractiveCard isOpen={this.state.isOpen && this.state.fetched}>
          <header>
            <h5>iLearn</h5>
            <ButtonGroup minimal className='np--popover-actions'>
              <Button icon='map' intent={Intent.PRIMARY}/>
              <Button icon='cog' intent={Intent.PRIMARY}/>
            </ButtonGroup>
          </header>

          <main>
            <p>Concepts on this Page</p>
            <ConceptsField
              concepts={this.state.selected}
              onRemove={this.didRemoveConcept}/>
            <TagSuggest
              onSelect={this.didAddConcept}/>

            <h5>Resource Rating</h5>
            <p>Pick a rating for this resource to indicate its quality</p>
            <ButtonGroup fill minimal>
              <Button>Easy</Button>
              <Button>Alright</Button>
              <Button>Too Hard!</Button>
            </ButtonGroup>
          </main>
        </InteractiveCard>
      </div>
    )
  }
}

export { ActionCard }
