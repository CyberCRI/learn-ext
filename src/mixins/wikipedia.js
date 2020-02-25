// Wrapper implementing the API calls to wikipedia for searches.
// Exposes the Wiki object with `opensearch` and `summary` methods.
import _ from 'lodash'
import queryStrings from 'query-string'


const wikiRequest = async ({ lang, params }) => {
  const endpoint = `https://${lang}.wikipedia.org/w/api.php`
  const url = queryStrings.stringifyUrl({ url: endpoint, query: params })

  const r = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    headers: {
      'Api-User-Agent': env.wikiapi_user_agent,
    },
  })
  return await r.json()
}

class WikiAPI {
  srquery (query, lang='en') {
    // The opensearch api endpoint we've been using is not particularly reliable
    // in terms of quality of results. Of course that's not ideal, and with
    // Julien's help on figuring out the wikipedia api parameters, we switch to
    // `action: query`.
    //
    // Similar to how other endpoints are handled, a transformation is applied
    // to the response which extracts results to an object list.
    //
    // API Sandbox: https://to.noop.pw/wikiapi-sandbox--query
    //
    // Relevant: Issue #53.
    const apiProps = ['pageprops', 'pageterms', 'pageimages', 'extracts', 'links']
    const params = {
      // Main query term go here, under gsrsearch.
      gsrsearch: query,

      action: 'query',
      format: 'json',
      origin: '*',
      redirects: 1,
      converttitles: 1,
      formatversion: 2,

      prop: apiProps.join('|'),
      plnamespace: 0,

      wbptterms: 'description',

      // Control "extracts" props.
      exsentences: 2,
      exlimit: 16,
      exintro: 1,
      explaintext: 1,
      exsectionformat: 'plain',

      generator: 'search',
      gsrnamespace: 0,
      gsrqiprofile: 'classic',
      gsrwhat: 'text',
      gsrinfo: ['totalhits', 'suggestion'].join('|'),
      gsrenablerewrites: 1,
      gsrsort: 'relevance',
    }

    const transform = (response) => {
      // This transformation is quite simple -- we pick the keys we're
      // interested in.
      const transformItem = (item) => {
        const i = _(item)
        return {
          lang,
          isDisambiguation: i.has('pageprops.disambiguation'),
          title: i.get('title'),
          subtitle: i.get('pageprops.wikibase-shortdesc'),
          description: i.get('terms.description.0'),
          extract: i.get('extract'),

          wikidata_id: i.get('pageprops.wikibase_item'),
          thumbnail: i.get('thumbnail'),
        }
      }
      return response.query.pages.map(transformItem)
    }
    return wikiRequest({ lang, params }).then(transform)
  }

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
    const params = {
      action: 'opensearch',
      format: 'json',
      namespace: 0,
      redirects: 'resolve',
      limit: 15,
      suggest: 1,
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

    return wikiRequest({ lang, params }).then(transform)
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
    const url = `${endpoint}/${encodeURIComponent(titleSlug)}`

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

    const fetchPageProps = async () => {
      const r = await fetch(url, { crossOrigin: 'cors' })
      return await r.json()
    }

    return fetchPageProps().then(transform)
  }
}

const Wiki = new WikiAPI()

export default Wiki

// [!todo] switch to prefixsearch next since that endpoint is specifically
// designed for searching with prefixes (obviously...). However this will
// require a second query to `query` action (of course) to get the props
// that include wikidata ids. Note that there is cri api gateway also available
// which we'll switch to later. Later, because we want to have spanish language
// as well.
//
// /w/api.php?
//   action=query&
//   format=json&
//   list=prefixsearch&
//   pssearch=ibm%20sel

// /w/api.php?
//   action=query&
//   format=json&
//   prop=extracts|pageprops|extlinks|info|langlinks|pageimages|images&
//   pageids=23861711&
//   exsentences=4&
//   exlimit=5&
//   exintro=1&
//   explaintext=1&
//   elexpandurl=1&
//   inprop=url|displaytitle

// https://apigw.cri-paris.org/api/wpgw/search?search=json&lang=en
