import { setup } from '../_commons'
import { renderReactComponent } from '~mixins/react-helpers'

import { DashboardView } from '~views/dashboard'

window.addEventListener('load', async () => {
  await setup()
  renderReactComponent('resources', DashboardView)
})

