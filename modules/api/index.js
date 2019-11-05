import { request } from '~mixins'
import store from '~mixins/persistence'

const pathFor = (route, subs) => {
  return `https://welearn.noop.pw/api/${route}`
}

export const API = {
  resources: ({ limit=20, start=1 }) => {
    return store
      .get('user')
      .then(({ uid }) => {
        return request({
          url: pathFor(`user/${uid}/resource`),
          data: { limit, start },
        })
      })
  },
  groupResources: ({ limit=20, start=1, groupId }) => {
    return request({
      url: pathFor(`group/${groupId}/resources`),
      data: { limit, start },
    })
  },
  allResources: ({ limit=20, start=1 }) => {
    return request({
      url: pathFor('resources'),
      data: { limit, start },
    })
  },
}

