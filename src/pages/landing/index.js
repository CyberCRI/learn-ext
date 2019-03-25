import { renderReactComponent } from '~mixins/utils'

import { DownloadLinks } from './download-buttons'
import { BlogCallout } from './cards'
import Atlas from '~components/Atlas'
import { request } from '~mixins'
import InlineSVG from 'svg-inline-react'

import './_landing.sass'

import cri_logo from '~media/logo-cri.white.green.svg'
import planet from '~media/planets/cri.planets-all.svg'
import learning from '~media/illustrations/learning.svg'
import people from '~media/illustrations/people.svg'


document.addEventListener('apploaded', () => {
  renderReactComponent('download-links', DownloadLinks)

  renderReactComponent('logo', InlineSVG, { src: cri_logo, element: 'figure' } )
  renderReactComponent('planets', InlineSVG, { src: planet, element: 'figure' } )
  renderReactComponent('people', InlineSVG, { src: people, element: 'figure' } )
  renderReactComponent('learning', InlineSVG, { src: learning, element: 'figure' } )

  renderReactComponent('callout', BlogCallout )

  request({ url: 'https://noop-pub.s3.amazonaws.com/opt/dotatlas_tmp.json' })
    .then((points) => {
      renderReactComponent('atlas', Atlas, { dataPoints: points })
    })
})
