import React from 'react'

import { Button, ButtonGroup } from '@blueprintjs/core'
import { RiThumbUpLine, RiThumbDownLine } from 'react-icons/ri'

import { ResourceVotingAPI } from '@ilearn/modules/api'


export const VoteButtons = ({ resource_id, has_voted, upvotes, downvotes, ...props }) => {
  const [ displayVoteCount, setDisplayVoteCount ] = React.useState({ upvotes, downvotes })
  const [ voteState, setVoteState ] = React.useState(has_voted)

  const didClickUpvote = async () => {
    if (voteState === 'UPVOTE') {
      setVoteState('')
      await ResourceVotingAPI.deletevote({ resource_id })
    } else {
      setVoteState('UPVOTE')
      await ResourceVotingAPI.upvote({ resource_id })
    }

    const votes = await ResourceVotingAPI.getcount({ resource_id })
    setDisplayVoteCount(votes)
  }
  const didClickDownvote = async () => {
    if (voteState === 'DOWNVOTE') {
      setVoteState('')
      await ResourceVotingAPI.deletevote({ resource_id })
    } else {
      setVoteState('DOWNVOTE')
      await ResourceVotingAPI.downvote({ resource_id })
    }

    const votes = await ResourceVotingAPI.getcount({ resource_id })
    setDisplayVoteCount(votes)
  }

  return <div>
    <ButtonGroup>
      <Button
        icon={<RiThumbUpLine/>}
        active={voteState === 'UPVOTE'}
        onClick={didClickUpvote}
        text={displayVoteCount.upvotes}/>
      <Button
        icon={<RiThumbDownLine/>}
        active={voteState === 'DOWNVOTE'}
        onClick={didClickDownvote}
        text={displayVoteCount.downvotes}/>
    </ButtonGroup>
  </div>
}
