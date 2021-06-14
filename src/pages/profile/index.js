import queryStrings from 'query-string'

import { setup } from '../_commons'
import { renderReactComponent } from '~mixins/react-helpers'

import { UserProfile } from '~views/profile'

window.addEventListener('load', async () => {
  const queryArgs = queryStrings.parse(window.location.search)
  const userId = queryArgs.user_id
  const currentUserId = window.jstate.user && window.jstate.user.uid
  const editable = currentUserId === userId

  await setup()
  renderReactComponent('user-profile', UserProfile, { userId, editable })
})
