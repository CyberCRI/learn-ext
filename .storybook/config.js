import { configure } from '@storybook/react'

const loadStories = () => {
  // Import the storybook modules
  require('../docs/stories/index.js')
}

configure(loadStories, module)

