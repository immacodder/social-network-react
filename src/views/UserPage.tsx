import {
  Box,
  Avatar,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
} from '@material-ui/core'
import { format } from 'date-fns'
import { CalendarAccount } from 'mdi-material-ui'
import React from 'react'
import { useAppSelector } from '../hooks'

export function UserPage() {
  const userInfo = useAppSelector((state) => state.user.userState)
 
  if (userInfo === 'initializing' || userInfo === 'signed out') {
    console.log('User is initializing or signed out')
    return null
  }

  const p = userInfo

  return (
    <>
      <Container>
        <Card elevation={8}>
          <CardContent>
            <Stack sx={{ textAlign: 'center', alignItems: 'center' }} gap={2}>
              <Avatar
                sx={{ mx: 'auto', height: '100px', width: '100px' }}
                src={p.profileImage || undefined}
              >
                {p.firstName[0] + p.secondName[0]}
              </Avatar>
              <Typography variant="h5">{`${p.firstName} ${p.secondName}`}</Typography>
              <Stack direction="row" gap={1}>
                <CalendarAccount sx={{ color: 'text.secondary' }} />
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {format(p.dateOfBirth, `MMMM do yyyy`)}
                </Typography>
              </Stack>
              {p.biography ? (
                <Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    About me
                  </Typography>
                  <Typography variant="body2">{p.biography}</Typography>
                </Box>
              ) : (
                <Typography>This user prefers to keep it secret</Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </>
  )
}
