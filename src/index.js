import '@blueprintjs/core/lib/css/blueprint.css'
import $ from 'jquery'

import Popout from './components/popout'
import { renderReactComponent } from './components/utils'


const EXT_ROOT_ID = 'ilearn-ext'

const mountRootContainer = () => {
  return ($(`<div id="${EXT_ROOT_ID}"></div>`)
    .appendTo('body'))
}

document.addEventListener('DOMContentLoaded', () => {
  mountRootContainer()
  renderReactComponent(EXT_ROOT_ID, Popout)
})

mountRootContainer()
renderReactComponent(EXT_ROOT_ID, Popout)
