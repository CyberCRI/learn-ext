import { setup } from '../_commons'
import { renderReactComponent } from '~mixins/react-helpers'

import { UserProfile } from '~views/profile'

window.addEventListener('load', async () => {
  const userId = window.jstate.user.uid

  await setup()
  renderReactComponent('dashboard', UserProfile, { userId, editable: true })
})
