import reqwest from 'reqwest'


export const jsonFixture = async (key) => {
  // Return json file fixture from global __FIXTURES__ object.
  // Transforms the file content as js object.
  const keyname = /\.json$/.test(key) ? key : `${key}.json`
  return reqwest({
    url: `/base/tests/fixtures/${keyname}`,
    type: 'json',
    method: 'get',
    contentType: 'application/json',
  })
}
