// Wrapper implementing the API calls to the ilearn api.
import { request } from '~mixins'


// Get the absolute url for specific api routes.
const endpointFor = (path) => `${env.rootapi_url}/${path}`


class ILearnAPI {
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
      url: endpointFor('api/learn'),
      method: 'post',
      data: params,
    })
  }

  fetchConcepts (url) {
    return request({
      url: endpointFor('api/concepts'),
      data: { url },
    })
  }

  crowdSourcing (params) {
    // Call the /api/crowdsourcing endpoint.
    // Request params include:
    // ressource_url, concept_title, reliability_variation
    return request({
      url: endpointFor('api/crowdsourcing'),
      method: 'put',
      data: params,
    })
  }
}

const RootAPI = new ILearnAPI()

export default RootAPI
