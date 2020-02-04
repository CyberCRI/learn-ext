import { create } from '@storybook/theming'

export default create({
  base: 'light',

  // UI
  appBorderColor: 'lightgrey',
  appBorderRadius: 6,

  // Typography
  fontBase: '"Barlow", "Overpass", sans-serif',
  fontCode: '"Overpass Mono", "Source Code Pro", "FiraCode", monospace',

  // Form colors
  inputBorderRadius: 4,
  inputBorderColor: 'lightgrey',

  brandTitle: 'WeLearn - Design Specs',
  brandUrl: 'https://welearn.cri-paris.org',
})
