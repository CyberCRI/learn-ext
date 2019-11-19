import { jsonFixture } from '~test-mixins'
import { ConceptSet, Exceptions } from '~components/popover/api-store'


describe('~components/popover/api-store', () => {
  context('#ConceptSet', async () => {
    let sampleConcepts

    before(async () => {
      sampleConcepts = await jsonFixture('api.enhancedconcepts.postgresql-org')
    })

    it('builds the concept set index', () => {
      const cset = new ConceptSet(sampleConcepts.concepts)
      expect(cset.index)
        .to.be.an('object')
        .that.includes.keys('title', 'score', 'wiki_id', 'lang')
      expect(cset.index.score)
        .to.be.an('array')
      expect(cset.index.lang)
        .to.equal('en')
    })

    context('.append', () => {
      let cset
      beforeEach(() => {
        cset = new ConceptSet(sampleConcepts.concepts)
      })

      it('should add a new concept to list', () => {
        cset.append({ title: 'Boop', lang: 'en' })
        expect(cset.index.title)
          .to.include('Boop')
      })

      it('should raise if concept is in different language', () => {
        const badAppend = () => cset.append({ title: 'Boop', lang: 'fr' })
        expect(badAppend)
          .to.throw()
      })

      it('should not change if concept is duplicated', () => {
        const fixtureLen = cset.items.length
        const otherConcept = { title: 'Boop', lang: 'en' }

        // Append first item
        cset.append(otherConcept)
        expect(cset.index.title)
          .to.have.lengthOf(fixtureLen + 1)

        // Append it again
        cset.append(otherConcept)
        expect(cset.index.title)
          .to.have.lengthOf(fixtureLen + 1)
      })

      it('is chainable', () => {
        cset
          .append({ title: 'noot', lang: 'en' })
          .append({ title: 'boot', lang: 'en' })

        expect(cset.index.title)
          .to.include.members(['noot', 'boot'])
      })
    })

    context('.remove', () => {
      const conceptBoop = { title: 'Boop', lang: 'en' }
      const conceptWoot = { title: 'Woot', lang: 'en' }
      let cset

      beforeEach(() => {
        cset = new ConceptSet(sampleConcepts.concepts)
        cset
          .append(conceptBoop)
          .append(conceptWoot)
      })

      it('should remove concept that exists in index', () => {
        cset.remove(conceptBoop)
        expect(cset.index.title)
          .to.not.include('Boop')
      })

      it('should not raise if concept to be removed is not in index', () => {
        const badRemove = () => cset.remove({ title: 'kitty' })
        expect(badRemove)
          .to.not.throw()
      })

      it('is chainable', () => {
        cset
          .remove(conceptBoop)
          .remove(conceptWoot)

        expect(cset.index.title)
          .to.not.include.members(['Boop', 'Woot'])
      })
    })
  })
})
