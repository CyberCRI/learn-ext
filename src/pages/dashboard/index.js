import { renderReactComponent } from '~mixins/utils'

import { DashboardView } from '~components/dashboard'

document.addEventListener('apploaded', () => {
  renderReactComponent('resources', DashboardView)
})
