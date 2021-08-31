import {
	Avatar,
	Box,
	Divider,
	IconButton,
	Paper,
	Tooltip,
	Stack,
	Typography,
} from '@material-ui/core'
import { ThumbUp, ThumbDown, Reply } from 'mdi-material-ui'
import React from 'react'
import { fire } from '..'
import { useAppSelector } from '../hooks'
import { CommentType, UserType } from '../types'

export function Comment(p: CommentType) {
	const user = useAppSelector((s) => s.user.userState as UserType)

	function onLike(isLike: boolean = true) {
		const property = isLike ? 'likedBy' : 'dislikedBy'

		if (p[property].find((v) => v === user.uid)) return

		const commentRef = `comments/${p.uid}`

		fire
			.firestore()
			.doc(commentRef)
			.update({
				[isLike ? 'dislikedBy' : 'likedBy']:
					fire.firestore.FieldValue.arrayRemove(user.uid),
			})

		fire
			.firestore()
			.doc(commentRef)
			.update({ [property]: fire.firestore.FieldValue.arrayUnion(user.uid) })
	}

	return (
		<Box display="flex" alignItems="flex-start" mb={2} justifyContent="stretch">
			<Avatar sx={{ width: 48, height: 48 }}>TK</Avatar>
			<Paper
				sx={{ ml: 1, p: 2, pb: 1, width: '100%', borderRadius: '16px' }}
				elevation={4}
			>
				<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
					<Typography variant="caption">Tigran Khachaturian</Typography>
					<Typography variant="caption">07/07 at 5:00pm</Typography>
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
									p.likedBy.find((v) => v === user.uid) ? 'primary' : 'default'
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
									p.dislikedBy.find((v) => v === user.uid) ? 'error' : 'default'
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
							<IconButton>
								<Reply />
							</IconButton>
						</Tooltip>
					</Stack>
				</Box>
			</Paper>
		</Box>
	)
}
