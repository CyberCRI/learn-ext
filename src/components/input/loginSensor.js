import store from '~mixins/persistence'

const loginPromptLocation = '/pages/onboarding.html'

export const ensureLogin = async ({ autoRedirect=false }) => {
  const user = await store.get('user')
  if (!user || user.signedIn !== true) {
    if (autoRedirect) {
      window.location.assign(loginPromptLocation)
    } else {
      throw new Error('Not Logged In')
    }
  } else {
    return user
  }
}
