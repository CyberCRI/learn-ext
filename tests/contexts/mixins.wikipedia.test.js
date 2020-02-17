import Wiki from '~mixins/wikipedia'

describe('~mixins/wikipedia', () => {
  context('#opensearch', () => {
    it('should query wikipedia api with matching pages', async () => {
      const results = await Wiki.srquery('india')
      expect(results)
        .to.be.an('array')

      expect(results[0])
        .to.be.an('object')
        .that.includes.keys('lang', 'title', 'wikidata_id')
    })

    it('should respect language setting', async () => {
      const results = await Wiki.srquery('india', 'hi')
      expect(results[0])
        .to.include({ 'lang': 'hi' })
    })
  })

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
