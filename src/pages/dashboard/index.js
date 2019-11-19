import { renderReactComponent } from '~mixins/react-helpers'

import { ensureLogin } from '~components/input/loginSensor'
import { DashboardView } from '~components/dashboard'

const init = () => {
  renderReactComponent('resources', DashboardView)
}

document.addEventListener('apploaded', () => {
  ensureLogin({ autoRedirect: true })
    .then(init)
})
