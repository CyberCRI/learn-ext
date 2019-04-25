import { renderReactComponent } from '~mixins/utils'
import { PopOverlay } from '~components/popover/overlay'

import './_popover.sass'


document.addEventListener('apploaded', () => {
  renderReactComponent('popout', PopOverlay )
})
