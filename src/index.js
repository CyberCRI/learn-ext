import $ from 'jquery'

import { renderReactComponent } from '~mixins/utils'
import { ActionCard } from '~components/popout'

import './styles/index.sass'

const EXT_ROOT_ID = 'ilearn-ext'

const mountRootContainer = () => {
  return ($(`<div id="${EXT_ROOT_ID}"></div>`)
    .appendTo('body'))
}

const injectContent = () => {
  mountRootContainer()
  renderReactComponent(EXT_ROOT_ID, ActionCard)
}

injectContent()
