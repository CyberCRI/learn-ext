// Wrapper implementing the API calls to wikipedia for searches.
// Exposes the Wiki object with `opensearch` and `summary` methods.
import _get from 'lodash/get'
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
      return response.query.pages.map((item) => ({
        lang,
        title: _get(item, 'title'),
        subtitle: _get(item, 'pageprops.wikibase-shortdesc'),
        description: _get(item, 'terms.description.0'),
        extract: _get(item, 'extract'),

        wikidata_id: _get(item, 'pageprops.wikibase_item'),
        thumbnail: _get(item, 'thumbnail'),
        representations: [
          { lang, title: _get(item, 'title') },
        ],
      }))
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
    const titleSlug = title.replace(/\s+/ig, '_')
    const url = `${endpoint}/${encodeURIComponent(titleSlug)}`

    const transform = (r) => {
      return {
        wikibaseId: _get(r, 'wikibase_item'),
        lang: _get(r, 'lang'),
        url: _get(r, 'content_urls.desktop.page'),

        title: _get(r, 'title'),
        description: _get(r, 'description'),
        extract: _get(r, 'extract'),
        thumbnail: _get(r, 'thumbnail.source', null),
      }
    }

    const fetchPageProps = async () => {
      const r = await fetch(url, { crossOrigin: 'cors' })
      return await r.json()
    }

    return fetchPageProps().then(transform)
  }

  async prefixsearch (query, lang='en') {
    // returns list of items through prefix search. Doesnt contain everything
    // we need but it's okay for now. We'll make a separate request to fetch
    // properties we need.
    const results = await wikiRequest({ lang, params: {
      action: 'query',
      format: 'json',
      list: 'prefixsearch',
      pssearch: query,
      pslimit: 30,
      origin: '*',
    }})
    const matches = results.query.prefixsearch

    // fetch pageprops for the pageids above^
    const pprops = await wikiRequest({ lang, params: {
      action: 'query',
      format: 'json',
      prop: 'extracts|pageprops|info|pageimages',
      pageids: matches.map(page => page.pageid).join('|'),
      exsentences: 4,
      exlimit: 5,
      exintro: 1,
      explaintext: 1,
      inprop: 'url|displaytitle',
      origin: '*',
    }})
    const pageprops = pprops.query.pages

    return matches
      .filter(page => !!pageprops[page.pageid].pageprops)
      .map(page => {
        const item = pageprops[page.pageid]
        return {
          lang,
          title: _get(item, 'title'),
          subtitle: _get(item, 'pageprops.wikibase-shortdesc'),
          description: _get(item, 'terms.description.0'),
          extract: _get(item, 'extract'),

          wikidata_id: _get(item, 'pageprops.wikibase_item'),
          thumbnail: _get(item, 'thumbnail'),
          representations: [
            { lang, title: _get(item, 'title') },
          ],
        }
      })
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
