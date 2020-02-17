import queryStrings from 'query-string'
import jwt from 'jwt-decode'

import { setup } from '~views/ingress'

import './style.scss'


const discoverDependencies = async () => {
  const queryArgs = queryStrings.parse(window.location.search)
  // Try to get lang, exauth and rurl from queryArgs, if exauth or rurl missing,
  // bail.
  const deps = {
    rurl: queryArgs.rurl,
    exauth: queryArgs.exauth,
    lang: queryArgs.lang || navigator.language || 'en',
  }

  console.log(jwt(deps.exauth))

  if (!deps.rurl || !deps.exauth) {
    throw new Error('rurl and exauth are both required.')
  }
  return deps
}


document.addEventListener('apploaded', () => {
  discoverDependencies()
    .then((args) => {
      setup(args)
    })
    .catch((e) => {
      // render error state.
      console.log('Err', e)
    })
})
