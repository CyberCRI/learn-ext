import Wiki from '@ilearn/modules/api/wikipedia'

describe('@ilearn/wikipedia', () => {
  context('#prefixsearch', () => {
    it('returns pages using wiki api', async () => {
      const items = await Wiki.prefixsearch('json')
      expect(items).to.be.an('array')
    })
  })
})
