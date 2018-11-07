import { request, getCanonicalUrl } from './utils'

const ENDPOINT = 'https://api-ilearn.zen.noop.pw/concepts'


const get_concepts = () => {
  const page_url = getCanonicalUrl()
  console.log(page_url)

  return request({
    url: ENDPOINT,
    data: { url: page_url },
  })
}

export { get_concepts }
