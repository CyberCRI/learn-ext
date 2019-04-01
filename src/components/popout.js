import React, { Component } from 'react'
import { List } from 'immutable'

import { Button, ButtonGroup, Intent } from '@blueprintjs/core'
import { Spinner } from '@blueprintjs/core'

import RootAPI from '~mixins/root-api'
import TagSuggest from '~components/tag-suggest'
import { InteractiveCard } from '~components/cards'
import ConceptsField from '~components/input/concepts'

import './popout.sass'


class ActionCard extends Component {
  constructor (props) {
    super(props)

    this.state = {
      pageUrl: props.pageUrl,
      concepts: List(),
      selected: List(),
      fetched: false,
      inflight: false,
      isOpen: false,
      knowledgeProg: 0.5,
    }

    this.didAddConcept = this.didAddConcept.bind(this)
    this.didRemoveConcept = this.didRemoveConcept.bind(this)
    this.didChooseRating = this.didChooseRating.bind(this)
    this.shouldFetchConcepts = this.shouldFetchConcepts.bind(this)
    this.shouldPushChanges = this.shouldPushChanges.bind(this)
  }

  componentDidMount () {
    browser.runtime.onMessage.addListener((msg) => {
      this.shouldFetchConcepts()
      if (msg.action == 'openPopout') {
        this.setState({
          tabId: msg.tabId,
          pageTitle: msg.state.title,
          isOpen: true,
        }, this.shouldPushChanges)
      }

      if (msg.action == 'closePopout') {
        this.setState({ isOpen: false })
      }
    })
  }

  shouldClosePopout () {
    const message = { action: 'closePopout', tabId: this.state.tabId }

    browser.runtime.sendMessage(message)
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
    browser.storage.local
      .get('user')
      .then(({ user }) => {
        RootAPI.learn({
          url: this.state.pageUrl,
          concepts: this.state.selected.toJS(),
          username: user.username,
          knowledge_progression: this.state.knowledgeProg,
          title: this.state.pageTitle,
        }).then(() => {
          this.setState({ learned: true, inflight: false, errored: false })
        }).fail(() => {
          this.setState({ inflight: false, errored: true })
        })
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
    const isDuplicate = this.state.selected
      .filter((i) => i.label === item.label)
      .size === 1
    if (!isDuplicate) {
      const selected = this.state.selected.push(item)
      this.setState({ selected }, this.shouldPushChanges)
    }
  }

  didRemoveConcept (item, selected) {
    this.setState({ selected }, () => this.shouldUpdateConcept(item))
  }

  didChooseRating () {
    this.dispatchAction('closePopout')
    this.shouldPushChanges()
  }

  dispatchAction (action) {
    browser.runtime.sendMessage({ action, tabId: this.state.tabId })
  }

  render () {
    return (
      <div className='card-container'>
        <InteractiveCard isOpen={this.state.isOpen && !this.state.fetched} className='np-basic-card'>
          <div><Spinner/></div>
        </InteractiveCard>

        <InteractiveCard isOpen={this.state.isOpen && this.state.fetched}>
          <header>
            <ButtonGroup minimal className='np--popover-actions'>
              <Button
                icon='map'
                intent={Intent.PRIMARY}
                onClick={() => this.dispatchAction('openCartography')}/>
              <Button
                icon='cog'
                intent={Intent.PRIMARY}
                onClick={() => this.dispatchAction('openSettings')}/>
            </ButtonGroup>
          </header>

          <main>
            <p>Concepts on this Page</p>
            <ConceptsField
              concepts={this.state.selected}
              onRemove={this.didRemoveConcept}/>
            <TagSuggest
              onSelect={this.didAddConcept}/>

            <ButtonGroup fill minimal>
              <Button onClick={() => this.setState({ knowledgeProg: 1 }, this.didChooseRating) }>Easy</Button>
              <Button onClick={() => this.setState({ knowledgeProg: 0.5 }, this.didChooseRating) }>Alright</Button>
              <Button onClick={() => this.setState({ knowledgeProg: 0 }, this.didChooseRating) }>Too Hard!</Button>
            </ButtonGroup>
          </main>
        </InteractiveCard>
      </div>
    )
  }
}

export { ActionCard }
