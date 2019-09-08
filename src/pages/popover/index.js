import { renderReactComponent } from '~mixins/react-helpers'
import { PopOverlay } from '~components/popover/overlay'

import './style.sass'


document.addEventListener('apploaded', () => {
  renderReactComponent('popout', PopOverlay )
})
