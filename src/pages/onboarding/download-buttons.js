import React from 'react'
import clsx from 'classnames'
import { Card, Elevation, Popover, Button, Position } from '@blueprintjs/core'
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
  const modifiers = clsx('np-download-link', { small: !!props.small })

  return (
    <Card
      className={modifiers}
      interactive
      elevation={Elevation.TWO}>
      <a href={props.url}>
        <IconContext.Provider value={{ className: 'browser-icon' }}>
          { props.children }
        </IconContext.Provider>
      </a>
    </Card>
  )
}

const ChromeLink = (props) => (
  <DownloadButton {...props} url={env.extension_url_chrome}>
    <FaChrome/>
    <h3>Add to <strong>Chrome</strong></h3>
  </DownloadButton>
)

const FirefoxLink = (props) => (
  <DownloadButton {...props} url={env.extension_url_firefox}>
    <FaFirefox/>
    <h3>Add to <strong>Firefox</strong></h3>
  </DownloadButton>
)

const DownloadLinks = () => {
  const browser = detectBrowser()
  return (
    <div className='download-links'>
      {browser.firefox && <FirefoxLink/>}
      {browser.chrome && <ChromeLink/>}

      <Popover position={Position.BOTTOM_LEFT} modifiers={{ offset: '10' }} flip={false}>
        <Button minimal small icon='compressed'>Download Options</Button>
        <div className='download-options'>
          <h4>Using a different browser?</h4>
          <p>To download extension for a different browser, you may use the links below:</p>
          <FirefoxLink small/>
          <ChromeLink small/>
        </div>
      </Popover>
    </div>
  )
}

export { ChromeLink, FirefoxLink, DownloadLinks }
