// Initializers provide helper methods for stable environment setup in browser.
import store from '~mixins/persistence'
import { userId } from '~mixins/utils'


export const initDemoUser = async () => {
  const demoUser = {
    uid: userId('nugget@noop.pw'),
    username: 'nugget@noop.pw',
    groupId: 'beta',
    signedIn: true,
    demo: true,
  }
  return await store.set('user', demoUser)
}
