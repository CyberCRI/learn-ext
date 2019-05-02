import Wiki from '~mixins/wikipedia'

describe('~mixins/wikipedia', () => {
  context('#summary', () => {
    it('should transform api response', async () => {
      const summary = await Wiki.summary('France')

      expect(summary)
        .to.be.an('object')
        .that.includes.keys('lang', 'url', 'wikibaseId', 'title')
    })

    it('fetches summary in french', async () => {
      const summary = await Wiki.summary('France', 'fr')

      expect(summary.lang).to.equal('fr')
      expect(summary.wikibaseId).to.equal('Q142')
    })

    it('fetches summary in english', async () => {
      const summary = await Wiki.summary('France', 'en')
      expect(summary.lang).to.equal('en')
    })
  })
})
