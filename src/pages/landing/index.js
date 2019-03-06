import { renderReactComponent } from '~mixins/utils'

import { DownloadLinks, FirefoxLink } from './download-buttons'

import './_landing.sass'


document.addEventListener('apploaded', () => {
  renderReactComponent('download-links', DownloadLinks)
})
