import { renderReactComponent } from '~mixins/utils'
import { ActionCard } from '~components/popout'

import './_popover.sass'


document.addEventListener('apploaded', () => {
  renderReactComponent('popout', ActionCard, { pageUrl: window.location.hash.slice(1) } )
})
