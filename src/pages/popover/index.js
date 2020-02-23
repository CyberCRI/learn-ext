import { FocusStyleManager } from '@blueprintjs/core'
import { renderReactComponent } from '~mixins/react-helpers'
import { PopOverlay } from './overlay'

import './style.scss'

window.addEventListener('load', async () => {
  FocusStyleManager.onlyShowFocusOnTabs()
  renderReactComponent('popout', PopOverlay)
})
