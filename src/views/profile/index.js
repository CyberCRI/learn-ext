import React from 'react'
import { useAsync } from 'react-use'
import styled from 'styled-components'
import ColorHash from 'color-hash'

import { UserProfileAPI } from '@ilearn/modules/api'

import { DateTimePill } from '~components/pills'
import { UserResourceList } from './user-resources'


const colorHash = new ColorHash({ lightness: 0.5 })

const UserInfoContainer = styled.div`
  display: flex;
  margin-top: 10px;
  margin-bottom: 10px;
  padding: 10px;

  border-radius: 5px;
  background: #fff;

  .user-icon {
    display: block;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    text-align: center;
    padding: 5px;
    margin-right: 10px;

    span {
      font-size: 22px;
      line-height: 1;
      color: #fff;
      text-transform: uppercase;
    }
  }

  .username {
    font-size: 16px;
  }

  .joined {
    display: flex;
    white-space: pre;
  }
`

const UserProfileContainer = styled.div`
  .resources-list {
    .pagination {
      margin-top: 20px;
    }
  }

`

const UserInfo = ({ profile }) => {
  return <UserInfoContainer>
    <div className='user-icon' style={{ backgroundColor: colorHash.hex(profile.email) }}>
      <span>{profile.email[0]}</span>
    </div>
    <div className='info'>
      <div className='username'>{profile.email}</div>
      <div className='joined'>Joined <DateTimePill timestamp={profile.created_on}/></div>
    </div>
  </UserInfoContainer>
}


export const UserProfileHeader = ({ userId, ...props }) => {
  const profile = useAsync(async () => {
    return await UserProfileAPI.getProfile({ userId })
  }, [userId])

  return <UserProfileContainer>
    {profile.loading && <p>Loading</p>}
    <div className='profile-header'>
      {!profile.loading && !profile.error && <UserInfo profile={profile.value}/>}
    </div>
    <div className='resources-list'>
      <UserResourceList userId={userId}/>
    </div>
  </UserProfileContainer>
}
