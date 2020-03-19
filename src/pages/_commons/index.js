import { FocusStyleManager } from '@blueprintjs/core'

import { renderReactComponent } from '~mixins/react-helpers'

import { NavigationBar, updateContext } from './navigation-bar'

export const setup = async () => {
  console.log('WeLearn')
  console.log('build config', env)
  FocusStyleManager.onlyShowFocusOnTabs()
  renderReactComponent('navbar', NavigationBar)

  updateContext(window.jstate)
}
