import store from '~mixins/persistence'
import queryStrings from 'query-string'

import { userId } from '~mixins/utils'

const loginPromptLocation = '/pages/onboarding.html'

export const ensureLogin = async ({ autoRedirect=false }) => {
  const user = await store.get('user')
  const qParams = queryStrings.parse(window.location.search)
  if (!user || user.signedIn !== true) {
    if (qParams.demo === 'init') {
      // If in the url params, ?demo=init is present, we initialise with the
      // test user nugget
      const demoUser = {
        uid: userId('nugget@noop.pw'),
        username: 'nugget@noop.pw',
        groupId: 'beta',
        signedIn: true,
      }
      await store.set('user', demoUser)
      window.location.reload()
    } else if (autoRedirect) {
      window.location.assign(loginPromptLocation)
    } else {
      throw new Error('Not Logged In')
    }
  } else {
    return user
  }
}
