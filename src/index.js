import { browser } from '~procs/stubs'
import $ from 'cash-dom'

import { renderReactComponent } from '~mixins/react-helpers'
import FrameContainer from '~components/iframe'

const EXT_ROOT_ID = 'ilearn-ext-frame'
const frameUrl = browser.runtime.getURL('pages/popover.html')

const mountRootContainer = () => {
  // [!] Remove any stray element before appending the div.
  //     By standard, no two DOM elements can have same `id`. Although it's
  //     not strictly enforced, we'll follow the standards though.
  $(`#${EXT_ROOT_ID}`).remove()
  $(`<div id="${EXT_ROOT_ID}"></div>`)
    .appendTo('body')

  renderReactComponent(EXT_ROOT_ID, FrameContainer, { src: frameUrl })
}

mountRootContainer()
