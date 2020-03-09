import './view'
import { setupInstance } from './view/atlas'
import { setup as setupPage } from '~page-commons'

import { ResourceList } from './view'
import { renderReactComponent } from '~mixins/react-helpers'

function _parseInlinedObject (name) {
  const inlineScript = document.querySelector(`script[data-inline="${name}"]`)
  return JSON.parse(inlineScript.innerText)
}

window.addEventListener('load', () => {
  setupPage()
  const mapContainer = document.getElementById('map_root')
  const covidResources = _parseInlinedObject('covid_resources')

  setupInstance({ element: mapContainer })

  renderReactComponent('res_root', ResourceList, { items: covidResources })
})
