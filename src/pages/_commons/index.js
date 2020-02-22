import { FocusStyleManager } from '@blueprintjs/core'

import { renderReactComponent } from '~mixins/react-helpers'

import NavigationBar from './navigation-bar'

import './common.scss'

export const setup = async () => {
  FocusStyleManager.onlyShowFocusOnTabs()
  renderReactComponent('navbar', NavigationBar)
}
