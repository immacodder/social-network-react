import {
	Box,
	Card,
	CardContent,
	Container,
	Stack,
	Typography,
} from '@material-ui/core'
import { format } from 'date-fns'
import { CalendarAccount } from 'mdi-material-ui'
import { Post } from '../components/Post'
import { UserAvatar } from '../components/UserAvatar'
import { useAppSelector } from '../hooks'
import { usePosts } from '../hooks/usePosts'
import { useUserById } from '../hooks/useUserById'

interface Props {
	uid: string
}
export function UserPage(p: Props) {
	const comments = useAppSelector((s) => s.comments)
	const user = useUserById(p.uid)
	const posts = usePosts(p.uid)

	if (!user) return null

	const userPosts = posts.map((post) => (
		<Post
			{...post}
			key={post.uid}
			user={user}
			commentList={comments.filter((v) => v.parentPostUid === post.uid)}
		/>
	))

	return (
		<>
			<Container>
				<Card elevation={8}>
					<CardContent>
						<Stack sx={{ textAlign: 'center', alignItems: 'center' }} gap={2}>
							<UserAvatar
								uid={user.uid}
								sx={{ mx: 'auto', height: '100px', width: '100px' }}
							/>
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
			{userPosts.length ? (
				userPosts
			) : (
				<Box mt={4} display="flex" alignItems="center" justifyContent="center">
					<Typography>This user does not have any posts yet</Typography>
				</Box>
			)}
		</>
	)
}
