import qstring from 'query-string'
import urlParse from 'url-parse'

// Absolute url for opt server.
const endpointFor = (path) => `${env.optapi_host}/${path}`

// We only expect these protocols to be resolved.
const validProtocols = /^(http|https|ftp):/
const fallbackUrl = '#'

const urlIsSane = (url) => {
  const { protocol } = urlParse(url)
  return validProtocols.test(protocol)
}

const resolvedUrl = (kind, url) => {
  const endpoint = endpointFor(`og/meta/resolve/${kind}`)
  const query = qstring.stringify({ url })
  return `${endpoint}?${query}`
}

class MetaResolver {
  // Wrap resolvers so its API looks pretty!

  icon (url) {
    // Obtain resolvable URL for opengraph favicon image.
    // We'll use the origin of this url to keep caches working.
    if (!urlIsSane(url)) {
      return fallbackUrl
    }
    const { origin } = urlParse(url)
    return resolvedUrl('logo', origin)
  }

  image (url) {
    if (!urlIsSane(url)) {
      return fallbackUrl
    }
    return resolvedUrl('image', url)
  }
}

const OpenGraph = new MetaResolver()

export default OpenGraph
