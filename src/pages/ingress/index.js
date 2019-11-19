import queryStrings from 'query-string'

import { setup } from '~views/ingress'

import './style.scss'


document.addEventListener('apploaded', () => {
  setup(queryStrings.parse(location.search))
})
