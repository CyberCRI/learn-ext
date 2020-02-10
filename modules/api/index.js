import { request } from '~mixins'

const pathFor = (route, subs) => {
  return `${env.ngapi_host}/api/${route}`
}

const getUser = async () => {
  const u = window.jstate.user
  try {
    u.groupId = u.groups[0].guid
  } catch {}

  return u
}


export const API = {
  userResources: ({ limit=20, skip=1 }) => {
    return getUser()
      .then(({ uid }) => {
        return request({
          url: pathFor(`resources/user/${uid}`),
          data: { limit, skip },
        })
      })
  },
  groupResources: ({ limit=20, skip=1 }) => {
    return getUser()
      .then(({ groupId }) => {
        return request({
          url: pathFor(`resources/group/${groupId}`),
          data: { limit, skip },
        })
      })
  },
  allResources: ({ limit=20, skip=1 }) => {
    return request({
      url: pathFor('resources/'),
      data: { limit, skip },
    })
  },
  userMapLayer: () => {
    return getUser()
      .then(({ uid }) => {
        return request({
          url: pathFor('resources/map/user'),
          data: { user_id: uid },
        })
      })
  },
  groupMapLayer: () => {
    return getUser()
      .then(({ groupId }) => {
        return request({
          url: pathFor('resources/map/group'),
          data: { group_id: groupId },
        })
      })
  },
  entireMapLayer: () => {
    return request({ url: pathFor('resources/map/base') })
  },

  deleteResource: ({ resource_id }) => {
    return request({
      url: pathFor(`users/resource/${resource_id}`),
      method: 'delete',
    })
  },
  deleteConceptFromResource: ({ resource_id, wikidata_id }) => {
    return request({
      url: pathFor(`users/resource/${resource_id}/concept/${wikidata_id}`),
      method: 'delete',
    })
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

export const ServiceAPI = {
  groupList: () => {
    return request({
      url: pathFor('groups/'),
    })
  },

  setUserGroup: ({ guid }) => {
    return request({
      url: pathFor('users/me/groups'),
      method: 'patch',
      data: { guid },
    })
  },
}
