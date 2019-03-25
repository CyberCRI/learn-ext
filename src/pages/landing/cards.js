import React from 'react'
import clsx from 'classnames'
import { Card, Elevation, AnchorButton } from '@blueprintjs/core'
import { MdLocalActivity, MdQuestionAnswer, MdRssFeed } from 'react-icons/md'
import { IconContext } from 'react-icons'

const BlogCallout = () => (
  <Card elevation={Elevation.TWO} className='blog-callout'>
    <div>
      <h1>Get Involved</h1>
      <p>
        We value your thoughts and opinions. To learn more about the project,
        follow the updates, and to provide your feedback, please visit our blog.
      </p>
    </div>

    <aside>
      <div className='icons'>
        <IconContext.Provider value={{ className: 'co-icons' }}>
          <MdLocalActivity/>
          <MdQuestionAnswer/>
          <MdRssFeed/>
        </IconContext.Provider>
      </div>

      <AnchorButton
        large
        rightIcon='arrow-top-right'
        className='btn-blog'
        text='iLearn Project Blog'
        href='https://projects.cri-paris.org/projects/Jq2tzEMD/summary'/>

      <p>
        You can also email us at <a href='mailto:ilearn@cri-paris.org'>ilearn@cri-paris.org</a>
      </p>
    </aside>
  </Card>
)

export { BlogCallout }
