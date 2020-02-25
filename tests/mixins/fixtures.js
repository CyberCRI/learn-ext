
export const jsonFixture = (key) => {
  // Return json file fixture from global __FIXTURES__ object.
  // Transforms the file content as js object.
  const keyname = `${key}.json`

  return JSON.parse(window.__FIXTURES__[keyname])
}
