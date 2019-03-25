import React from 'react'
import clsx from 'classnames'
import { Card, Elevation } from '@blueprintjs/core'
import { FaChrome, FaFirefox } from 'react-icons/fa'
import { IconContext } from 'react-icons'


const detectBrowser = () => {
  // Bare minimum detection of browser using userAgent.
  // Tests using regex for either chrome or firefox.
  // [!] NOTE: It is very likely that this won't work well for all the cases
  //           but, having a simple whitelist we *can* confidently distinguish
  //           between the browsers we support.
  const ua = window.navigator.userAgent
  const firefox = /firefox/i.test(ua)
  const chrome = /chrome/i.test(ua)
  return { firefox, chrome }
}

const DownloadButton = (props) => {
  const modifiers = clsx('np-download-link')
  return (
    <Card className={modifiers} interactive elevation={Elevation.TWO}>
      <IconContext.Provider value={{ className: 'browser-icon' }}>
        { props.children }
      </IconContext.Provider>
    </Card>
  )
}

const ChromeLink = (props) => (
  <DownloadButton>
    <FaChrome/>
    <h3>Add to <strong>Chrome</strong></h3>
  </DownloadButton>
)

const FirefoxLink = (props) => (
  <DownloadButton>
    <FaFirefox/>
    <h3>Add to <strong>Firefox</strong></h3>
  </DownloadButton>
)

const DownloadLinks = () => (
  <div className='download-links'>
    <FirefoxLink/>
    <ChromeLink/>
  </div>
)

export { ChromeLink, FirefoxLink, DownloadLinks }
