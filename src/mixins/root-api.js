// Wrapper implementing the API calls to the ilearn api.
import { request } from '~mixins'
import _ from 'lodash'


// Get the absolute url for specific api routes.
const endpointFor = (path) => `${env.rootapi_host}/${path}`


class ILearnAPI {
  initializeUser (params) {
    // Create or update the user node.
    return request({
      url: endpointFor('prod/api/user'),
      method: 'post',
      data: params,
    })
  }

  learn (params) {
    // Calls the /api/learn endpoint. Requires an object with following keys:
    // ┌──────────────────────────────────────────────────────────┐
    // │                    url │ String                          │
    // │               concepts │ List[Dict<href, label, weight>] │
    // │               username │ String                          │
    // │                  title │ String                          │
    // │  knowledge_progression │ {0, 0.5, 1} = 0.5               │
    // └──────────────────────────────────────────────────────────┘
    return request({
      url: endpointFor('ext/api/learn'),
      method: 'post',
      data: params,
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

  fetchPortfolio (params) {
    return request({
      url: endpointFor('udev/api/portfolio'),
      data: params,
    })
  }
}

const RootAPI = new ILearnAPI()

export default RootAPI
