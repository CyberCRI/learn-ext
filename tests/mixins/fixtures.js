export const jsonFixture = (key) => {
  // Return json file fixture from global __FIXTURES__ object.
  // Transforms the file content as js object.
  const keyname = /\.json$/.test(key) ? key : `${key}.json`
  return JSON.parse(__FIXTURES__[keyname])
}
