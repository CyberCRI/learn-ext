import queryStrings from 'query-string'

import '../_commons/article-pages.scss'

import { setup } from '../_commons'
import { renderReactComponent } from '~mixins/react-helpers'

import { UserProfileHeader } from '~views/profile'

window.addEventListener('load', async () => {
  const queryArgs = queryStrings.parse(window.location.search)

  await setup()
  renderReactComponent('profile-header', UserProfileHeader, { userId: queryArgs.user_id })
})
