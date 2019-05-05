import { renderReactComponent } from '~mixins/utils'

import { OmniBar, FilterTools } from '~components/dashboard'
import { ResourceGrid } from '~components/dashboard/resources'

document.addEventListener('apploaded', () => {
  renderReactComponent('actions', OmniBar)
  renderReactComponent('results', FilterTools)
  renderReactComponent('resources', ResourceGrid)
})
