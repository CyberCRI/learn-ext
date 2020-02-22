import { FocusStyleManager } from '@blueprintjs/core'


import { renderReactComponent } from '~mixins/react-helpers'

import NavigationBar from './navigation-bar'
import { initNotifications } from './notifications'

export const setupDependencies = async () => {
  FocusStyleManager.onlyShowFocusOnTabs()
  renderReactComponent('navbar', NavigationBar)
}
