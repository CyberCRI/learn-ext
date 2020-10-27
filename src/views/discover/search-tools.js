import React from 'react'
import styled from 'styled-components'
import { useStore } from 'effector-react'

import { useLogger } from 'react-use'
import _ from 'lodash'

import { setCursor, $cursor, $progress } from './store'
import { userResources } from './store'
import { Tag, Spinner, NonIdealState } from '@blueprintjs/core'
import { ResourceGrid, Pagination } from '~components/resources'


const PlaceHolder = (props) => {
  return (
    <NonIdealState
      title='Browse or Search for Resources'
      icon='path-search'>
      <h2>Browse resources on map</h2>
      <p>Pick a region (or several) by clicking on the map. You can refine your
      selection by zooming in, and select several regions by holding <kbd>shift</kbd>
      while clicking.</p>
    </NonIdealState>
  )
}

const MatchStatsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
`

export const ResultItems = (props) => {
  const resources = useStore(userResources)
  const cursor = useStore($cursor)

  useLogger('ResultItems')

  const pages = _.chunk(resources, 20)
  const currentPage = pages[cursor.current - 1] || []

  React.useEffect(() => {
    return userResources.watch(() => setCursor({ count: pages.length, current: 1 }))
  }, [resources])


  return (
    <div className='matches'>
      <MatchStatsContainer>
        <Pagination
          count={cursor.count}
          cursor={cursor.current}
          onPaginate={(page) => setCursor({ current: page })}/>
        <div>
          <span><Tag minimal round>{resources.length}</Tag> Matches</span>
        </div>
      </MatchStatsContainer>
      {!currentPage && <PlaceHolder/>}
      <ResourceGrid resources={currentPage}/>
    </div>
  )
}

const ProgressDiv = styled.div`
  position: fixed;
  z-index: 100;
  padding: 10px;
  margin: auto;
  top: 60px;
  left: 0;
  right: 0;
  bottom: calc(50vh - 60px);
  width: 0;
  height: 0;
`

export const ProgressIndicator = (props) => {
  const progress = useStore($progress)

  return <ProgressDiv>{progress.loading && <Spinner/>}</ProgressDiv>
}
