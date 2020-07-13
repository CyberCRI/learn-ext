import queryStrings from 'query-string'

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

const request = async ({ url, method = 'get', query, data, ...options }) => {
  const body = method === 'get' ? undefined : JSON.stringify(data)
  const reqUrl = queryStrings.stringifyUrl({ url, query })

  const r = await fetch(reqUrl, {
    method, body,
    mode: 'cors',
    headers: { 'Content-Type': 'application/json' },
  })
  return await r.json()
}


export const API = {
  userResources: ({ limit=20, skip=0 }) => {
    return getUser()
      .then(({ uid }) => {
        return request({
          url: pathFor(`resources/user/${uid}`),
          query: { limit, skip },
        })
      })
  },
  groupResources: ({ limit=20, skip=0 }) => {
    return getUser()
      .then(({ groupId }) => {
        return request({
          url: pathFor(`resources/group/${groupId}`),
          query: { limit, skip },
        })
      })
  },
  allResources: ({ limit=20, skip=0 }) => {
    return request({
      url: pathFor('resources/'),
      query: { limit, skip },
    })
  },
  userMapLayer: () => {
    return getUser()
      .then(({ uid }) => {
        return request({
          url: pathFor('resources/map/user'),
          query: { user_id: uid },
        })
      })
  },
  groupMapLayer: () => {
    return getUser()
      .then(({ groupId }) => {
        return request({
          url: pathFor('resources/map/group'),
          query: { group_id: groupId },
        })
      })
  },
  entireMapLayer: () => {
    return request({ url: pathFor('resources/map/base') })
  },

  deleteResource: ({ resource_id }) => {
    return request({
      url: pathFor(`users/resource/${resource_id}`),
      method: 'DELETE',
    })
  },
  deleteConceptFromResource: ({ resource_id, wikidata_id }) => {
    return request({
      url: pathFor(`users/resource/${resource_id}/concept/${wikidata_id}`),
      method: 'DELETE',
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
      method: 'PATCH',
      data: { guid },
    })
  },
}

export const IngressAPI = {
  preprocess: ({ link }) => {
    const payload = { url: link }
    return request({ url: `${env.ngapi_host}/meta/preproc`, query: payload })
  },
  doc2vec: ({ link, lang }) => {
    const payload = { url: link, lang }
    return request({ url: `${env.ngapi_host}/textract/infer/link`, query: payload })
  },
}

export const CarteSearchAPI = {
  // Search concepts/resources from the carte apis. There are two apis currently
  // available: typeahead, which does prefix-search on concept lists; and
  // fulltext search which searches for any matches in entire resource object.
  // Limit, skip, are same format as standard pagination properties.
  typeahead: ({ q, limit, skip }) => {
    const payload = { q }
    return request({ url: `${env.ngapi_host}/carte/typeahead`, query: payload })
  },
  search: ({ q, limit, skip }) => {
    const payload = { q, limit, skip }
    return request({ url: `${env.ngapi_host}/carte/search`, query: payload })
  }
}
