import '~styles/fonts.css'
import './style.sass'

import $ from 'cash-dom'
import { NavigationBar } from '~page-commons'
import { renderReactComponent } from '~mixins/react-helpers'
import store from '~mixins/persistence'


// Common page initializers
const AppDidLoad = new Event('apploaded')

window.addEventListener('load', async () => {
  const appLang = await store.get('pref.lang') || 'en'

  // Add language attribute to document
  $('html').attr('lang', appLang)
  // Add a css class to body
  $('body').addClass(`lang-${appLang}`)

  renderReactComponent('navbar', NavigationBar)
  document.dispatchEvent(AppDidLoad)
})
