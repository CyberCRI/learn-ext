import _ from 'lodash'

export const fetchGroupLayer = async (id) => {
  const layers = {
    mooc: 'https://welearn.noop.pw/api/map?group_id=mooc',
    beta: 'https://welearn.noop.pw/api/map?group_id=beta',
    user: 'https://welearn.noop.pw/api/map?user_id=f8a3b78dfe023f9465d9da742741c28d',
  }
  return await fetch(layers[id])
    .then((r) => r.json())
    .then((concepts) => {
      let title

      return concepts.map((p) => {
        title = p.title_fr || p.title_en

        return {
          x: p.x_map_fr,
          y: p.y_map_fr,
          markerShape: 'square',
          label: _.truncate(title, { length: 16, separator: ' ' }),
          elevation: Math.max(p.elevation, .01),
        }
      }).filter((p) => p.x && p.y)
    })
}
