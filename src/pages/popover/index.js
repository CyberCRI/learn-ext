import { renderReactComponent } from '~mixins/react-helpers'
import { PopOverlay } from './overlay'

import './style.scss'


document.addEventListener('apploaded', () => {
  renderReactComponent('popout', PopOverlay)
})
