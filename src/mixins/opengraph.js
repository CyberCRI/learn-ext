import qstring from 'query-string'

// Absolute url for opt server.
const endpointFor = (path) => `${env.optapi_host}/${path}`

// We only expect these protocols to be resolved.
const ValidProtocolPattern = /^(http|https):/
const FallbackUrl = '#'

const urlIsSane = (url) => ValidProtocolPattern.test(url)

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
      return FallbackUrl
    }
    return `${env.ngapi_host}/meta/resolve/logo?url=${url}`
  }

  image (url) {
    if (!urlIsSane(url)) {
      return FallbackUrl
    }
    return resolvedUrl('image', url)
  }
}

const OpenGraph = new MetaResolver()

export default OpenGraph
