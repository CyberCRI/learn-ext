// Blueprint JS Bundles ~400kBs of unnecessary icons. As a workaround, we will
// replace the blueprint's `iconSvgPaths` with this modules.
//
// There's an active (30/07/19) discussion on github: @palantir/blueprint#2193
// But we don't use blueprint icons at all the places anyway: hence it'd be nice
// to have the required icons be put in here.
// I'm afraid we'll need to do some sort of generator magic here, I guess.
// However, I'll be doing it with a good-ol python transformation.

const icons = [
  'arrow-right',
  'blank',
  'book',
  'compressed',
  'cross',
  'id-number',
  'layout-circle',
  'layout-group-by',
  'layout-sorted-clusters',
  'maximize',
  'minimize',
  'path-search',
  'plus',
  'send-to-map',
  'sort-asc',
  'sort-desc',
]



export const IconSvgPaths16 = {
}

export const IconSvgPaths20 = {
}
