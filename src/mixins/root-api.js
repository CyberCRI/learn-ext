// Wrapper implementing the API calls to the ilearn api.
import { request } from '~mixins'
import _ from 'lodash'


// Get the absolute url for specific api routes.
const endpointFor = (path) => `${env.rootapi_host}/${path}`

const userInfo = async () => {
  const data = await browser.storage.local.get('user')
  return data.user
}

class ILearnAPI {
  initializeUser (params) {
    // Create or update the user node.
    return request({
      url: endpointFor('prod/api/user'),
      method: 'post',
      data: params,
    })
  }

  async learn (params) {
    // Calls the /api/learn endpoint. Requires an object with following keys:
    // ┌──────────────────────────────────────────────────────────┐
    // │                    url │ String                          │
    // │               concepts │ List[Dict<href, label, weight>] │
    // │               username │ String                          │
    // │                  title │ String                          │
    // │  knowledge_progression │ {0, 0.5, 1} = 0.5               │
    // └──────────────────────────────────────────────────────────┘
    const { uid } = await userInfo()
    const payload = {
      user_id: uid,
      ...params,
    }

    return request({
      url: endpointFor('prod/api/learn'),
      method: 'post',
      data: payload,
    })
  }

  async newConcept (params) {
    const { uid } = await userInfo()
    return request({
      url: endpointFor('prod/api/newconcept'),
      method: 'post',
      data: {
        url: params.url,
        title: params.title,
        lang: params.lang,
        user_id: uid,
      },
    })
  }

  async removeConcept (params) {
    return request({
      url: endpointFor('prod/api/crowdsourcing'),
      method: 'put',
      data: {
        url: params.url,
        title: params.title,
        lang: params.lang,
        reliability_variation: -1,
      },
    })
  }

  fetchConcepts (url) {
    const transform = (data) => {
      // Infer the page language from the concepts response. If empty, we'll
      // assume it to be `en`.
      const lang = _(data).get('concepts[0].lang', 'en')
      return { ...data, lang }
    }
    return request({
      url: endpointFor('prod/api/enhancedconcepts'),
      data: { url },
    }).then(transform)
  }

  crowdSourcing (params) {
    // Call the /api/crowdsourcing endpoint.
    // Request params include:
    // ressource_url, concept_title, reliability_variation
    return request({
      url: endpointFor('ext/api/crowdsourcing'),
      method: 'put',
      data: params,
    })
  }

  async fetchPortfolio () {
    const { uid } = await userInfo()
    return request({
      url: endpointFor('prod/api/portfolio'),
      data: { user_id: uid },
    })
  }

  async fetchUserMapOverlay () {
    const { uid } = await userInfo()

    return request({
      url: endpointFor('prod/api/map'),
      data: { user_id: uid },
    })
  }
}

const RootAPI = new ILearnAPI()

export default RootAPI
