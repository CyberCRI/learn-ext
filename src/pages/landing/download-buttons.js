import React from 'react'
import clsx from 'classnames'
import { Card, Elevation } from '@blueprintjs/core'
import { FaChrome, FaFirefox } from 'react-icons/fa'
import { IconContext } from 'react-icons'


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
