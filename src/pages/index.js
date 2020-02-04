import '~styles/fonts.css'
import './style.sass'

import { NavigationBar, initNotifications } from '~page-commons'
import { renderReactComponent } from '~mixins/react-helpers'


// Common page initializers
const AppDidLoad = new Event('apploaded')

window.addEventListener('load', async () => {
  document.dispatchEvent(AppDidLoad)
  renderReactComponent('navbar', NavigationBar)
})
