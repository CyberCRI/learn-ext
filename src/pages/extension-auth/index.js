import queryStrings from 'query-string'
import { browser } from '~procs/stubs'

import { renderReactComponent } from '~mixins/react-helpers'

import { ensureAuthTokens, getStoredToken } from '~procs/token-utils'
import { AuthStatus, AuthPromptConnection } from './status-view'

import './style.scss'


const getAuthApiUrl = () => queryStrings.stringifyUrl({
  url: `${env.ngapi_host}/api/auth/extension`,
  query: {
    callback: browser.runtime.getURL('pages/extension-auth.html'),
  },
})


window.addEventListener('load', async () => {
  const authorized = await ensureAuthTokens()

  if (authorized) {
    // Hey nice, this is an authorized user. But are they _just_ authorizing it?
    // We can infer this if the query string is non-empty.
    const newLogin = window.location.search.length > 0
    const token = await getStoredToken()

    renderReactComponent('main-view', AuthStatus, { token, newLogin })
  } else {
    // Not authorized. Whatever.
    const authUrl = getAuthApiUrl()
    renderReactComponent('main-view', AuthPromptConnection, { authUrl })
  }
})
