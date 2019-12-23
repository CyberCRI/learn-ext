import { Set, Map } from 'immutable'
import { jsonFixture } from '~test-mixins'
import { conceptIndexSet, resourceIndex, matchQuerySet } from '~views/discover/query-index'

describe('~search/query-index', () => {
  let sample = {}
  before(async () => {
    sample.concepts = jsonFixture('api.user-concept.20191105')
    sample.resources = jsonFixture('api.user-resource.20191105')
  })

  context('#conceptIndexSet', () => {
    it('builds index from concept set', () => {
      const csetidx = conceptIndexSet(sample.concepts.results)
      expect(csetidx)
        .to.satisfy(Set.isSet)
      expect(csetidx.size)
        .to.exist
      expect(csetidx.has(sample.concepts.results[0].wikidata_id))
        .to.be.true
    })
  })

  context('#resourceIndex', () => {
    it('builds resource index mapping set', () => {
      const resIdx = resourceIndex(sample.resources.results)
      expect(resIdx)
        .to.satisfy(Map.isMap)
    })

  })

  context('#matchQuerySet', () => {
    it('matches resources with one query concept', () => {
      const queryConceptId = 'Q1628157'
      const expectedResIds = [
        '9618724f68bf4f9a546011cf71866ce9',
        '2ccb1b610359fb610dd499dbf734235d',
      ]
      const resIdx = resourceIndex(sample.resources.results)
      const query = Set([ queryConceptId ])

      const matches = matchQuerySet(resIdx, query)
      expect(matches.size)
        .to.equal(2)
      expect(matches)
        .to.satisfy((m) => {
          return m.has(expectedResIds[0]) && m.has(expectedResIds[1])
        })
    })

    it('matches resources with multi concepts', () => {
      const resIdx = resourceIndex(sample.resources.results)
      const results = Set([
        '90e3ac5174caf43d30f150e0eef243a9',
        'd34133dfa68376b5fe88f8de72c9a3ae',
        '97b927b58550c5e8f63f2e3680c57697',
        '8207d4c5d00c665644d41dff92f928b6',
      ])

      const query1 = Set([
        'Q17637401',
        'Q544',
        'Q460791',  // "Thomas Wright", only links to one resource.
      ])
      const query2 = Set([
        'Q17637401',
        'Q544',
      ])
      const query3 = Set([ 'Q460791' ]) // Should only match last one.

      const match1 = matchQuerySet(resIdx, query1)
      const match2 = matchQuerySet(resIdx, query2)
      const match3 = matchQuerySet(resIdx, query3)

      expect(match1.size)
        .to.equal(4)
      expect(match2.size)
        .to.equal(4)
      expect(match3.size)
        .to.equal(1)

      expect(match1.keySeq().toSet().equals(results)).to.be.true
      expect(match1.equals(match2)).to.be.true
      expect(match1.isSuperset(match3)).to.be.true
    })
  })
})
