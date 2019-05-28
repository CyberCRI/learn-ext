import { configure, addParameters } from '@storybook/react'
import displaytheme from './displaytheme'
import '@storybook/addon-console'

const loadStories = () => {
  // Import the storybook modules
  require('../docs/stories/index.js')
}

addParameters({
  options: {
    theme: displaytheme,
  },
})

configure(loadStories, module)
