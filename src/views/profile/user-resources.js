import React from 'react'

import { UserProfileAPI } from '@ilearn/modules/api'

import { ResourceListView, ResourceGrid, Pagination } from '~components/resources'

export const UserResourceList = ({ userId, editable }) => {
  const [ resources, setResources ] = React.useState([])
  const [ count, setCount ] = React.useState(0)
  const [ limit, setLimit ] = React.useState(10)
  const [ cursor, setCursor ] = React.useState(1)

  const fetchResources = async (cursor) => {
    const { results, pagination } = await UserProfileAPI.resources({
      userId,
      limit,
      skip: (cursor - 1) * limit,
    })
    setResources(results.map(r => ({
      // [!hack] The API is supposed to return is_owner attribute for each
      // resource, but it doesn't.
      // This property is hence injected into the resource items if the optional
      // prop `editable` is set to true.
      is_owner: editable === true ? true : null,
      ...r,
    })))
    setCount(Math.floor(pagination.count / limit))
  }

  React.useEffect(() => {
    fetchResources(cursor)
  }, [cursor])

  const didPaginate = (cursor) => {
    setCursor(cursor)
  }

  return <div>
    <Pagination current={cursor} totalPages={count} onChange={didPaginate}/>
    <ResourceGrid resources={resources}/>
    <Pagination current={cursor} totalPages={count} onChange={didPaginate}/>
  </div>
}
