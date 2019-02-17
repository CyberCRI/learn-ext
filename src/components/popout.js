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


// const browser = {
//   runtime: {
//     onMessage: {
//       addListener: () => {}
//     }
//   }
// }


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
    this.shouldClosePopout = this.shouldClosePopout.bind(this)
  }

  componentDidMount () {
    browser.runtime.onMessage.addListener((msg) => {
      if (msg.action == 'togglePopout') {
        this.setState({ tabId: msg.tabId, isOpen: !this.state.isOpen }, this.shouldFetchConcepts())
      }

      // if (msg.action == 'closePopout') {
      //   this.setState({ isOpen: false })
      // }
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
        }, this.shouldPushChanges)
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
          title: document.title,
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
    const selected = this.state.selected.push(item)
    this.setState({ selected }, this.shouldPushChanges)
  }

  didRemoveConcept (item, selected) {
    console.log('REMOVED', item)
    this.setState({ selected }, () => this.shouldUpdateConcept(item))
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
              <Button icon='cog' intent={Intent.PRIMARY} onClick={() => browser.runtime.sendMessage({ action: 'showOptions' })}/>
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
              <Button onClick={() => this.setState({ knowledgeProg: 1 }, this.shouldClosePopout) }>Easy</Button>
              <Button onClick={() => this.setState({ knowledgeProg: 0.5 }, this.shouldClosePopout) }>Alright</Button>
              <Button onClick={() => this.setState({ knowledgeProg: 0 }, this.shouldClosePopout) }>Too Hard!</Button>
            </ButtonGroup>
          </main>
        </InteractiveCard>
      </div>
    )
  }
}

export { ActionCard }
