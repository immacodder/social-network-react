import { Avatar, CardHeader, Stack, Typography } from '@material-ui/core'
import { Card, Container } from '@mui/material'
import { useUserById } from '../hooks/useUserById'
import { UserType } from '../types'
import { UserAvatar } from './UserAvatar'

export function UserCard(p: UserType) {
	return (
		<Card>
			<CardHeader
				avatar={
					<UserAvatar uid={p.uid} sx={{ width: 75, height: 75 }} redirect />
				}
				title={<Typography>{p.firstName + ' ' + p.secondName}</Typography>}
				subheader={p.biography ?? <Typography>{p.biography}</Typography>}
			/>
			
		</Card>
	)
}

// <Card>
// 	<Stack direction="row" gap={2} sx={{alignItems:'center'}}>
// 		<UserAvatar uid={p.uid} sx={{width: 75, height: 75}} redirect />
// 		<Typography>{p.firstName + ' ' + p.secondName}</Typography>
// 	</Stack>
// 	{p.biography ?? <Typography>{p.biography}</Typography>}
// </Card>
