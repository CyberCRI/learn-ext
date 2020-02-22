import './style.scss'
import { setupDependencies } from './_commons'

// import { NavigationBar } from '~page-commons'
// import { renderReactComponent } from '~mixins/react-helpers'

// Common page initializers
const AppDidLoad = new Event('apploaded')

window.addEventListener('load', async () => {
  setupDependencies()
  document.dispatchEvent(AppDidLoad)
})
