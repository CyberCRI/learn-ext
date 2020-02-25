// Custom filter for markdown includes in pugjs markup used by src/pages
const headingPluginOpts = {
  className: 'section-id',
  prefixHeadingIds: false,
  enableHeadingLinkIcons: true,
  linkIcon: '§ ',
}

const md = require('markdown-it')({
  typographer: true,
  html: true,
}).use(require('markdown-it-github-headings'), headingPluginOpts)
  .use(require('markdown-it-footnote'))
  .use(require('markdown-it-task-lists'))

const transpile = (text, opts) => {
  return md.render(text)
}

module.exports = { transpile }
