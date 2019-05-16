import Fuse from 'fuse.js'

export const reFuse = (items, keys) => {
  // Factory for Fuse.js based searching in lists.
  const options = {
    shouldSort: true,
    threshold: .5,
    keys,
  }
  return new Fuse(items, options)
}
