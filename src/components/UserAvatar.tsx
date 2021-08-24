import { Avatar } from '@material-ui/core'
import { SxProps, Theme } from '@material-ui/system'
import React, { useEffect } from 'react'
import { fire } from '..'
import { useAppSelector } from '../hooks'
import { UserType } from '../types'

interface selfUser {
  isSelf: true
  sx?: SxProps<Theme>
}
interface notSelf {
  isSelf: false
  sx?: SxProps<Theme>
  uid: string
}
type Props = selfUser | notSelf

export function UserAvatar(p: Props) {
  let user = useAppSelector((state) =>
    typeof state.user.userState === 'string' ? null : state.user.userState,
  )
  let externalUser = null

  useEffect(() => {
    if (p.isSelf) return
    fire
      .firestore()
      .doc(`users/${p.uid}`)
      .get()
      // eslint-disable-next-line react-hooks/exhaustive-deps
      .then((v) => (externalUser = v.exists ? (v.data() as UserType) : null))
  }, [p])

  user = user ?? externalUser

  if (!user) {
    return null
  }

  return (
    <Avatar
      sx={p.sx}
      src={user.profileImage ?? undefined}
    >{`${user.firstName[0]} ${user.secondName[0]}`}</Avatar>
  )
}
