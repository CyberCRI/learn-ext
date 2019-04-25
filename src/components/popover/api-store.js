import _ from 'lodash'
import Enum from 'enum'
import RootAPI from '~mixins/root-api'


const RemoteState = new Enum([
  'readytofetch',
  'fetchingconcepts',
  'idle',
  'inflight',
  'error',
], { name: 'RemoteState', ignoreCase: true })


class ConceptSet {
  // Wrapper for Concepts. API supports adding new concepts, validation,
  // and the ordering.
  //
  // Schema { wikidata_id, title, similarity_score, lang }
  constructor (items) {
    this.items = items
    this.index = this.reindex()
  }

  reindex () {
    // Build an index of `items`, keying with values for title and wikidata
    // ids.
    const cursor = _(this.items)
    return {
      title: cursor.map('title'),
    }
  }

  append ({ title, lang }) {
    // Append if item does not exist already.
    // Ensure that the language matches!
    if (!this.lang === lang) {
    }
    if (!this.index.title.includes(title)) {
      // This one is new, append to the list and reindex.
      // Notice that we're replacing the items list with a new object.
      this.items = []
    }
  }

  remove () {
  }

  toJS () {
  }
}


class ExtAPIStore {
  constructor (url) {
    this.url = url
    this.state = RemoteState.readytofetch

    this.concepts = []
    this.kp = []

    this.unsyncedconcepts = []

    this.lang = 'en'
    this.user_id = ''

  }

  didAddConcept () {
    // Maybe Add Concept -> newconcept
    // Params: title,
  }

  didRemoveConcept () {
    // Endpoint: -> crowdsourcing
    // Params: wikidata_id
  }

  didChooseRating (value) {
    // Or, didOpenPopover
    // Or, didClosePopover
    // Updates the kp value.
    // Endpoint -> learn
    this.kp = value
  }

  async init () {
    // Fetch Concepts for the URL and perform necessary transformations.
    // Concept { wikidata_id, title, similarity_score, lang }
    RootAPI
      .fetchConcepts(this.url)
      .then((data) => {
        this.lang = data.lang
        this.concepts = new ConceptSet(data.concepts)
        this.state = RemoteState.idle
      })
      .fail(() => {
        this.state = RemoteState.error
      })
  }

  learn () {
    // payload:
    // { user_id, url, concepts: [ Concept ], knowledge_progression }
  }

  newconcept () {
    // payload:
    // { user_id, url, title, lang }
  }

  crowdsourcing () {
    // payload:
    // { url, title, lang, reliability_variation }
  }
}
