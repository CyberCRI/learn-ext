import React from 'react'

export const NoMatches = () => {
  return (
    <div className='grid error'>
      <h3>No Matches</h3>
      <p>Can't find any resource matching.</p>
      <p>You can see approximate matches or try again.</p>
    </div>
  )
}

export const NoContent = () => {
  return (
    <div className='grid error'>
      <h3>No Content</h3>
      <p>This is a placeholder message explaining why this dashboard is empty</p>
    </div>
  )
}
