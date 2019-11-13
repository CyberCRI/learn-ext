import { request } from '~mixins'
import store from '~mixins/persistence'

const pathFor = (route, subs) => {
  return `${env.ngapi_host}/api/${route}`
}

export const API = {
  userResources: ({ limit=20, start=1 }) => {
    return store
      .get('user')
      .then(({ uid }) => {
        return request({
          url: pathFor(`user/${uid}/resource`),
          data: { limit, start },
        })
      })
  },
  groupResources: ({ limit=20, start=1 }) => {
    return store
      .get('user')
      .then(({ groupId }) => {
        return request({
          url: pathFor(`group/${groupId}/resources`),
          data: { limit, start },
        })
      })
  },
  allResources: ({ limit=20, start=1 }) => {
    return request({
      url: pathFor('resources/'),
      data: { limit, start },
    })
  },
  userMapLayer: () => {
    return store
      .get('user')
      .then(({ uid }) => {
        return request({
          url: pathFor('map'),
          data: { user_id: uid },
        })
      })
  },
  groupMapLayer: () => {
    return store
      .get('user')
      .then(({ groupId }) => {
        return request({
          url: pathFor('map'),
          data: { group_id: groupId },
        })
      })
  },
  entireMapLayer: () => {
    return request({ url: pathFor('map') })
  },
}

export const ResourceAPI = {
  user: API.userResources,
  group: API.groupResources,
  everything: API.allResources,
}

export const MapLayerAPI = {
  user: API.userMapLayer,
  group: API.groupMapLayer,
  everything: API.entireMapLayer,
}

// User
const EndpointUser = {
  create: (email, group_id) => {
    request({
      url: 'api/user',
      method: 'post',
      data: { email, group_id },
    })
  },

  update: (user_id, group_id) => {
    request({
      url: `api/user/${user_id}`,
      method: 'put',
      data: { group_id },
    })
  },

  delete: (user_id) => {
    request({
      url: `api/user/${user_id}`,
      method: 'delete',
    })
  },
}

