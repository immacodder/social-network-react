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
import { Post } from '../components/Post'
import { useAppSelector } from '../hooks'
import { PostType } from '../types'

interface Props {
	userPosts: PostType[]
}
export function UserPage(p: Props) {
	const user = useAppSelector((state) => state.user.userState)
	const comments = useAppSelector((s) => s.comments)
	if (typeof user === 'string') return null

	return (
		<>
			<Container>
				<Card elevation={8}>
					<CardContent>
						<Stack sx={{ textAlign: 'center', alignItems: 'center' }} gap={2}>
							<Avatar
								sx={{ mx: 'auto', height: '100px', width: '100px' }}
								src={user.profileImage || undefined}
							>
								{user.firstName[0] + user.secondName[0]}
							</Avatar>
							<Typography variant="h5">{`${user.firstName} ${user.secondName}`}</Typography>
							<Stack direction="row" gap={1}>
								<CalendarAccount sx={{ color: 'text.secondary' }} />
								<Typography variant="body1" sx={{ color: 'text.secondary' }}>
									{format(user.dateOfBirth, `MMMM do yyyy`)}
								</Typography>
							</Stack>
							{user.biography ? (
								<Box>
									<Typography variant="h6" sx={{ mb: 1 }}>
										About me
									</Typography>
									<Typography variant="body2">{user.biography}</Typography>
								</Box>
							) : (
								<Typography>This user prefers to keep it secret</Typography>
							)}
						</Stack>
					</CardContent>
				</Card>
			</Container>
			{p.userPosts.map((post) => (
				<Post
					{...post}
					key={post.uid}
					user={user}
					commentList={comments.filter((v) => v.parentPostUid === post.uid)}
				/>
			))}
		</>
	)
}
