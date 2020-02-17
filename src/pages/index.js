import '~styles/fonts.css'
import './style.sass'
import { FocusStyleManager } from '@blueprintjs/core'

import { NavigationBar } from '~page-commons'
import { renderReactComponent } from '~mixins/react-helpers'

// Common page initializers
const AppDidLoad = new Event('apploaded')

window.addEventListener('load', async () => {
  FocusStyleManager.onlyShowFocusOnTabs()
  renderReactComponent('navbar', NavigationBar)

  document.dispatchEvent(AppDidLoad)
})
