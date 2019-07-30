import { renderReactComponent } from '~mixins/react-helpers'

import { DashboardView } from '~components/dashboard'

document.addEventListener('apploaded', () => {
  renderReactComponent('resources', DashboardView)
})
