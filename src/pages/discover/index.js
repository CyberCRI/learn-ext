import { setup } from '../_commons'

import { renderView } from '~views/discover'

import './style.scss'


window.addEventListener('load', async () => {
  await setup()
  await renderView()
  console.log('Rendered all')
})
