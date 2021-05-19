import queryStrings from 'query-string'

import { setup } from '../_commons'
import { renderReactComponent } from '~mixins/react-helpers'

import { UserProfile } from '~views/profile'

window.addEventListener('load', async () => {
  const queryArgs = queryStrings.parse(window.location.search)

  await setup()
  renderReactComponent('user-profile', UserProfile, { userId: queryArgs.user_id })
})
