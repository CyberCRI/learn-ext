import { renderReactComponent } from '~mixins/react-helpers'
import { PopOverlay } from './overlay'

import '../_commons/common.scss'
import './style.scss'

window.addEventListener('load', async () => {
  renderReactComponent('popout', PopOverlay)
})
