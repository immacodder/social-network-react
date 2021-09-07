import {
	Box,
	Divider,
	IconButton,
	Paper,
	Tooltip,
	Stack,
	Typography,
} from '@material-ui/core'
import { ThumbUp, ThumbDown, Reply } from 'mdi-material-ui'
import { useAppSelector } from '../hooks'
import { useUserById } from '../hooks/useUserById'
import { CommentType, UserType } from '../types'
import { UserAvatar } from './UserAvatar'
import { formatDistance } from 'date-fns'
import { firebaseApp } from '../firebase'
import {
	getFirestore,
	doc,
	updateDoc,
	arrayRemove,
	arrayUnion,
} from 'firebase/firestore'

const db = getFirestore(firebaseApp)

interface Props extends CommentType {
	onReplyClick: (user: UserType) => void
}

export function Comment(p: Props) {
	const selfUser = useAppSelector((s) => s.user.userState as UserType)
	const user = useUserById(p.authorUid)

	if (!user) return null

	function onLike(isLike: boolean = true) {
		const property = isLike ? 'likedBy' : 'dislikedBy'

		if (p[property].find((v) => v === selfUser.uid)) return

		const commentRef = `comments/${p.uid}`

		updateDoc(doc(db, commentRef), {
			[isLike ? 'dislikedBy' : 'likedBy']: arrayRemove(selfUser.uid),
		})

		updateDoc(doc(db, commentRef), {
			[property]: arrayUnion(selfUser.uid),
		})
	}

	return (
		<Box display="flex" alignItems="flex-start" mb={2} justifyContent="stretch">
			<UserAvatar
				redirect
				uid={p.authorUid}
				sx={{ width: '48px', height: '48px' }}
			/>
			<Paper
				sx={{ ml: 1, p: 2, pb: 1, width: '100%', borderRadius: '16px' }}
				elevation={4}
			>
				<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
					<Typography variant="caption">{`${user.firstName} ${user.secondName}`}</Typography>
					<Typography variant="caption">
						{formatDistance(p.createdAt, new Date(), {
							includeSeconds: true,
							addSuffix: true,
						})}
					</Typography>
				</Box>
				<Typography variant="body1" sx={{ my: 1 }}>
					{p.bodyText}
				</Typography>
				<Divider />
				<Box display="flex" justifyContent="space-between">
					<Stack direction="row">
						<Stack direction="row" sx={{ alignItems: 'center' }}>
							<Tooltip
								title="Like"
								color={
									p.likedBy.find((v) => v === selfUser.uid)
										? 'primary'
										: 'default'
								}
							>
								<IconButton
									onClick={() => onLike(true)}
									edge="start"
									sx={{ pl: '12px' }}
								>
									<ThumbUp />
								</IconButton>
							</Tooltip>
							<Typography>{p.likedBy.length}</Typography>
						</Stack>
						<Stack direction="row" sx={{ alignItems: 'center' }}>
							<Tooltip
								onClick={() => onLike(false)}
								title="Dislike"
								color={
									p.dislikedBy.find((v) => v === selfUser.uid)
										? 'error'
										: 'default'
								}
							>
								<IconButton>
									<ThumbDown />
								</IconButton>
							</Tooltip>
							<Typography>{p.dislikedBy.length}</Typography>
						</Stack>
					</Stack>
					<Stack direction="row">
						<Tooltip title="Reply">
							<IconButton onClick={() => p.onReplyClick(user)}>
								<Reply />
							</IconButton>
						</Tooltip>
					</Stack>
				</Box>
			</Paper>
		</Box>
	)
}
