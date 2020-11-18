import React from 'react'
import clsx from 'classnames'
import { Card, Elevation, Popover, Button, Position } from '@blueprintjs/core'
import { FaChrome, FaFirefox } from 'react-icons/fa'
import { IconContext } from 'react-icons'

import { i18n } from '@ilearn/modules/i18n'

const i18nT = i18n.context('pages.onboarding.extensionDownload')


const detectBrowser = () => {
  // Bare minimum detection of browser using userAgent.
  // Tests using regex for either chrome or firefox.
  // [!] NOTE: It is very likely that this won't work well for all the cases
  //           but, having a simple whitelist we *can* confidently distinguish
  //           between the browsers we support.
  const ua = window.navigator.userAgent
  const firefox = /firefox/i.test(ua)
  const chrome = /chrome/i.test(ua)
  return { firefox, chrome, any: chrome || firefox }
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
  <DownloadButton {...props} url='https://chrome.google.com/webstore/detail/aheppdfnfcfnojcaipdajboppllolgpo'>
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

const AvailableDownloads = ({ boxed = false }) => (
  <div className={clsx('download-options', { boxed })}>
    <h4>{i18nT('options.title')}</h4>
    <p>{i18nT('options.description')}</p>
    <FirefoxLink small/>
    <ChromeLink small/>
  </div>
)

const DownloadOptions = () => (
  <Popover position={Position.LEFT} modifiers={{ offset: '10' }} flip={false}>
    <Button minimal icon='download' text={i18nT('options.label')}/>
    <AvailableDownloads/>
  </Popover>
)

const DownloadLinks = () => {
  const browser = detectBrowser()
  return (
    <div className='download-links'>
      {browser.firefox && <FirefoxLink/>}
      {browser.chrome && <ChromeLink/>}

      {!browser.any && <AvailableDownloads boxed/>}
      {browser.any && <DownloadOptions/>}
    </div>
  )
}

export { ChromeLink, FirefoxLink, DownloadLinks }
