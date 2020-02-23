import queryStrings from 'query-string'
import jwt from 'jwt-decode'

import { setup } from '../_commons'
import { setup as setupIngress } from '~views/ingress'

import './style.scss'


const discoverDependencies = async () => {
  const queryArgs = queryStrings.parse(window.location.search)
  // Try to get lang, exauth and rurl from queryArgs, if exauth or rurl missing,
  // bail.
  const deps = {
    url: queryArgs.rurl,
    token: queryArgs.exauth,
  }

  if (!deps.url || !deps.token) {
    throw new Error('rurl and exauth are both required.')
  }
  return deps
}

window.addEventListener('load', async () => {
  await setup()
  discoverDependencies()
    .then((args) => {
      setupIngress(args)
    })
    .catch((e) => {
      // render error state.
      console.log('Err', e)
    })
})
