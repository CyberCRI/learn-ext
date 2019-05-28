// Wrapper implementing the API calls to wikipedia for searches.
// Exposes the Wiki object with `opensearch` and `summary` methods.
import { request, nsuuid } from '~mixins'
import { context, Runtime } from '~mixins/utils'
import Enum from 'enum'
import _ from 'lodash'

const HEADERS = {
  'Api-User-Agent': env.wikiapi_user_agent,
}

export const PageTypes = new Enum([
  'standard',
  'stub',
  'disambiguation',
  'empty',
], { name: 'WikiPageType', ignoreCase: true })


class WikiAPI {
  opensearch (query, lang='en') {
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
    const endpoint = `https://${lang}.wikipedia.org/w/api.php`
    const payload = {
      action: 'opensearch',
      format: 'json',
      namespace: 0,
      limit: 10,
      suggest: 1,
      requestid: nsuuid(query),
      search: query,
    }

    const transform = (response) => {
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

    const requestType = context() === Runtime.extension
      ? 'json'
      : 'jsonp'

    return request({
      url: endpoint,
      type: requestType,
      data: payload,
      crossOrigin: true,
      headers: HEADERS,
    }).then(transform)
  }

  summary (title, lang='en') {
    // Fetch the summary of a wikipedia page given the title.
    // Note that we won't use the regular endpoint as used in opensearch, since
    // this endpoint is the rest API, and different than the other wikimedia
    // API.
    const endpoint = `https://${lang}.wikipedia.org/api/rest_v1/page/summary`

    // Wikipedia API expects title slug, which is the title, with spaces
    // replaced with underscores.
    const titleSlug = _(title).replace(/\s+/ig, '_')
    const url = `${endpoint}/${titleSlug}`

    const transform = (response) => {
      const r = _(response)

      return {
        wikibaseId: r.get('wikibase_item'),
        lang: r.get('lang'),
        url: r.get('content_urls.desktop.page'),

        title: r.get('title'),
        description: r.get('description'),
        extract: r.get('extract'),
        thumbnail: r.get('thumbnail.source', null),
      }
    }
    return request({
      url: url,
      type: 'json',
      crossOrigin: true,
      headers: HEADERS,
    }).then(transform)
  }
}

const Wiki = new WikiAPI()

export default Wiki
