import { FocusStyleManager } from '@blueprintjs/core'

import { renderReactComponent } from '~mixins/react-helpers'

import { NavigationBar } from './navigation-bar'
import { setGlobalContext } from './store'

export const setup = async () => {
  console.log(`%cWeLearn %c${env.info_version}`, 'font-size: 32px;', 'font-size: 12px;')
  console.log('> build env %o', env)

  FocusStyleManager.onlyShowFocusOnTabs()
  renderReactComponent('navbar', NavigationBar)

  setGlobalContext(window.jstate)
}
