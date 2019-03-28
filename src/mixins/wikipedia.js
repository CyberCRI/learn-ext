// Wrapper implementing the API calls to wikipedia for searches.
import { request, nsuuid } from '~mixins'
import _ from 'lodash'

const HEADERS = {
  'Api-User-Agent': env.wikiapi_user_agent,
}


class WikiAPI {
  transformOpenSearch (response) {
    // Transform opensearch flat array list to a collection.
    // r: [ <query>, [ <titles> ], [ <descriptions> ], [ <urls> ]]
    // f(r): [ { title, description, url, id } ]
    // where `id` is the normalised `title`.
    //
    // The first element of the response is ignored (hence _.tail is used).

    const zipper = (title, description, url) => {
      const id = _.kebabCase(title)
      return { id, title, description, url }
    }

    return _
      .chain(response)
      .tail()
      .unzipWith(zipper)
      .value()
  }

  opensearch (query) {
    // Request Opensearch endpoint from Wikipedia API.
    // The request payload keeps a `requestid` to keep track of the request sent
    // while the response is obtained through padded json `json-p` with a
    // random callback and executed with contained payload.
    //
    // This was required to bypass CORS and `same-origin` policy.
    // API Docs are at: https://to.noop.pw/wikiapi-sandbox--opensearch-docs
    //
    // The response is further transformed to a collection.
    //
    // Also see: WikiAPI.transformOpenSearch
    const req_payload = {
      action: 'opensearch',
      format: 'json',
      namespace: 0,
      limit: 20,
      suggest: 1,
      requestid: nsuuid(query),
      search: query,
    }

    return request({
      url: env.wikiapi_endpoint,
      type: 'jsonp',
      data: req_payload,
      crossOrigin: true,
      headers: HEADERS,
    }).then(this.transformOpenSearch)
  }

  summary (title) {
    // Fetch the summary of a wikipedia page given the title.
    // Note that we won't use the regular endpoint as used in opensearch, since
    // this endpoint is the rest API, and different than the other wikimedia
    // API.
    const endpoint = 'https://en.wikipedia.org/api/rest_v1/page/summary'

    return request({
      url: `${endpoint}/${title}`,
      type: 'json',
      crossOrigin: true,
      headers: HEADERS,
    })
  }
}

const Wiki = new WikiAPI()

export default Wiki
