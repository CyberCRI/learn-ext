// Wrapper implementing the API calls to the ilearn api.
import { request } from '~mixins/utils'


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
      method: 'POST',
      data: params,
    })
  }

  fetchConcepts (url) {
    return request({
      url: endpointFor('api/enhancedconcepts'),
      data: { url },
    })
  }

  crowdSourcing () {
    // [TODO]
  }
}

const RootAPI = new ILearnAPI()

export default RootAPI
