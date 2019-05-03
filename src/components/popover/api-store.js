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


export const Exceptions = {
  ConceptLangError: new Error('Language of `concept` does not match index'),
}


export class ConceptSet {
  // Wrapper for Concepts. API supports adding new concepts, validation,
  // and the ordering.
  //
  // Schema { wikidata_id, title, similarity_score, lang }
  constructor (items) {
    this.items = items
    this.reindex()
  }

  reindex () {
    // Build an index of `items`, keying with values for title and wikidata
    // ids.
    const cursor = _(this.items)
    this.index = {
      title: cursor.map('title').value(),
      score: cursor.map('similarity_score').value(),
      wiki_id: cursor.map('wikidata_id').value(),
      lang: cursor.get('0.lang'),
    }
    return this
  }

  append ({ title, lang }) {
    // Append if item does not exist already.
    // Ensure that the language matches!
    if (this.index.lang !== lang) {
      throw Exceptions.ConceptLangError
    }
    if (!_.includes(this.index.title, title)) {
      // This one is new, append to the list and reindex.
      // Notice that we're replacing the items list with a new object.
      this.items = [...this.items, { title, lang }]
      this.reindex()
    }
    return this
  }

  remove ({ title }) {
    this.items = _.reject(this.items, ['title', title])
    this.reindex()
    return this
  }

  toJS () {
  }
}


export class ExtAPIStore {
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
    const payload = {
      url: this.url,
      concepts: this.concepts,
      knowledge_progression: this.kprog,
    }
    RootAPI
      .learn(payload)
      .then((data) => {
        setStatus(201)
      })
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
