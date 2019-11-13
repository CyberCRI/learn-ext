import { Set } from 'immutable'
import { fetchLayer, bases } from '~views/discover/layers'

describe('~views/discover/layers', () => {
  context('#bases', () => {
    it('builds a set of base map points', () => {
      expect(bases.points).to.satisfy(Set.isSet)
    })
    it('builds a set of labels', () => {
      expect(bases.labels).to.satisfy(Set.isSet)
    })
    it('correctly performs set operations on the sets', () => {
      // Union with itself. Should stay equal.
      const unionPoints = bases.points.union(bases.points)
      expect(unionPoints).to.satisfy((upts) => bases.points.equals(upts))
    })
  })

  context('#fetchLayer', () => {
    it('fetches user layer as set', async () => {
      const userLayer = await fetchLayer('everything')
      expect(userLayer).to.satisfy(Set.isSet)
    })
  })
})
