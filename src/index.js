import '@blueprintjs/core/lib/css/blueprint.css'
import $ from 'jquery'

import Popout from '~components/popout'
import TagSuggest from '~components/input/tag-suggest'
import { renderReactComponent } from '~mixins/utils'
import { WikiAPI } from '~mixins/wikipedia'


const EXT_ROOT_ID = 'ilearn-ext'

const mountRootContainer = () => {
  return ($(`<div id="${EXT_ROOT_ID}"></div>`)
    .appendTo('body'))
}

document.addEventListener('DOMContentLoaded', () => {
  mountRootContainer()
  renderReactComponent(EXT_ROOT_ID, Popout)

  renderReactComponent('proto', TagSuggest)
})

// mountRootContainer()
