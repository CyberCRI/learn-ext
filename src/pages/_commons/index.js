import { FocusStyleManager } from '@blueprintjs/core'

import { renderReactComponent } from '~mixins/react-helpers'

import NavigationBar from './navigation-bar'

export const setup = async () => {
  FocusStyleManager.onlyShowFocusOnTabs()
  renderReactComponent('navbar', NavigationBar)
}
