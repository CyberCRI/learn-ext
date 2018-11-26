// Wrapper implementing the API calls to wikipedia for searches.
import { request, nsuuid } from '~mixins/utils'

const HEADERS = {
  'Api-User-Agent': env.wikiapi_user_agent,
}


class WikiAPI {
  opensearch (query) {
    const req_payload = {
      action: 'opensearch',
      format: 'json',
      requestid: nsuuid(query),
      namespace: 0,
      limit: 20,
      suggest: 1,
      search: query
    }

    return request({
      url: env.wikiapi_endpoint,
      type: 'jsonp',
      data: req_payload,
      headers: HEADERS,
    })
  }
}

export { WikiAPI }
