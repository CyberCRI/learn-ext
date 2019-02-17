import './style.sass'

import { NavigationBar } from '~page-commons'
import { renderReactComponent } from '~mixins/utils'


// Common page initializers
const AppDidLoad = new Event('apploaded')


window.addEventListener('load', () => {
  console.info('Init Page')
  renderReactComponent('navbar', NavigationBar)

  document.dispatchEvent(AppDidLoad)
})
