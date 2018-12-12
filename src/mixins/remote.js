import { request, getCanonicalUrl } from './utils'


const ENDPOINT = 'https://ilearn.cri-paris.org/ext/api/enhancedconcepts'


const get_concepts = () => {
  const page_url = getCanonicalUrl()

  return request({
    url: ENDPOINT,
    data: { url: page_url },
  })
}

export { get_concepts }
