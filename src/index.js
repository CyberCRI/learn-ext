import $ from 'jquery'
import { renderReactComponent } from '~mixins/utils'

import FrameContainer from '~components/iframe'


const EXT_ROOT_ID = 'ilearn-ext-frame'

const pageUrl = window.location.toString()
const frameUrl = browser.runtime.getURL('pages/popover.html')


const mountRootContainer = () => {
  const frameSrc = `${frameUrl}#${pageUrl}`

  const el = $(`<div id="${EXT_ROOT_ID}"></div>`)
    .appendTo('body')

  renderReactComponent(EXT_ROOT_ID, FrameContainer, { src: frameSrc })
}

mountRootContainer()
