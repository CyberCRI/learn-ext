import React from 'react'
import ReactDOM from 'react-dom'

import { browser } from '../stubs'
import FrameContainer from './frame'

const EXT_ROOT_ID = 'ilearn-ext-frame'
const frameUrl = browser.runtime.getURL('pages/popover.html')

const injectedDivStyles = `
  filter: none !important;
  display: block !important;
  width: 0 !important;
  height: 0 !important;
  opacity: 1 !important;
  margin: 0 !important;
`

const mountRootContainer = () => {
  const injectedFrameNode = document.createElement('div')
  injectedFrameNode.setAttribute('style', injectedDivStyles)
  injectedFrameNode.setAttribute('id', EXT_ROOT_ID)

  document.body.appendChild(injectedFrameNode)

  ReactDOM.render(<FrameContainer src={frameUrl}/>, injectedFrameNode)
}

mountRootContainer()
