import { renderReactComponent } from '~mixins/react-helpers'

import { DashboardView } from '~views/dashboard'

const init = async () => {
  renderReactComponent('resources', DashboardView)
}

document.addEventListener('apploaded', () => {
  init()
})
