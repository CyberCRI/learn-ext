import { setup } from '../_commons'
import { setupInstance, renderView } from '~views/discover'

import './style.scss'

window.addEventListener('load', async () => {
  await setup()
  setupInstance({
    element: document.getElementById('atlas'),
  })

  renderView()
})

