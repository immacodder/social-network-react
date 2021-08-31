import * as Yup from 'yup'
import {
	Avatar,
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	CardHeader,
	Container,
	Divider,
	IconButton,
	ImageList,
	ImageListItem,
	Stack,
	Tooltip,
	Typography,
} from '@material-ui/core'
import { Form, Formik } from 'formik'
import {
	ThumbDown,
	ThumbUp,
	Comment as CommentIcon,
	Share,
} from 'mdi-material-ui'
import { Comment } from './Comment'
import { TextFieldValidate } from './TextFieldValidate'
import React, { useState } from 'react'
import { CommentType, PostType, UserType } from '../types'
import { fire } from '..'
import { v4 } from 'uuid'
import { useAppSelector } from '../hooks'

interface Props extends PostType {
	user: UserType
	commentList: CommentType[]
}

export function Post(p: Props) {
	const [isCommenting, setIsCommenting] = useState(false)
	const user = useAppSelector((s) => s.user.userState as UserType)

	function onCommentSubmit({ commentBody }: { commentBody: string }) {
		setIsCommenting(false)
		const uid = v4()
		const comment: CommentType = {
			authorUid: user.uid,
			bodyText: commentBody,
			dislikedBy: [],
			likedBy: [],
			parentPostUid: p.uid,
			uid,
		}
		fire.firestore().collection('comments').doc(uid).set(comment)
	}

	function onLike(isLike: boolean = true) {
		const property = isLike ? 'likedBy' : 'dislikedBy'

		if (p[property].find((v) => v === user.uid)) return

		const postRef = `posts/${p.uid}`

		fire
			.firestore()
			.doc(postRef)
			.update({
				[isLike ? 'dislikedBy' : 'likedBy']:
					fire.firestore.FieldValue.arrayRemove(user.uid),
			})

		fire
			.firestore()
			.doc(postRef)
			.update({ [property]: fire.firestore.FieldValue.arrayUnion(user.uid) })
	}

	return (
		<Container sx={{ mt: 2, mb: 4 }}>
			<Card elevation={4}>
				<CardHeader
					title={<Typography variant="subtitle1">{p.title}</Typography>}
					subheader="Tigran Khachaturian"
					avatar={
						<Avatar
							sx={{ width: 48, height: 48 }}
							src={p.user.profileImage ?? undefined}
						>
							{`${p.user.firstName[0]}${p.user.secondName[0]}`}
						</Avatar>
					}
				/>
				<CardContent>
					<Typography>{p.bodyText}</Typography>
				</CardContent>
				{!!p.imageUrls.length && (
					<ImageList
						variant={p.imageUrls.length > 4 ? 'masonry' : 'standard'}
						cols={p.imageUrls.length === 1 ? 1 : 2}
						gap={4}
					>
						{p.imageUrls.map((v) => (
							<ImageListItem key={v}>
								<img src={v} />
							</ImageListItem>
						))}
					</ImageList>
				)}
				<Divider />
				<Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
					<Stack direction="row">
						<Stack direction="row" sx={{ alignItems: 'center' }}>
							<Tooltip title="Like">
								<IconButton
									color={p.likedBy.includes(user.uid) ? 'primary' : 'default'}
									onClick={() => onLike(true)}
								>
									<ThumbUp />
								</IconButton>
							</Tooltip>
							<Typography>{p.likedBy.length}</Typography>
						</Stack>
						<Stack direction="row" sx={{ alignItems: 'center' }}>
							<Tooltip title="Dislike">
								<IconButton
									color={
										p.dislikedBy.includes(user.uid) ? 'error' : 'default'
									}
									onClick={() => onLike(false)}
								>
									<ThumbDown />
								</IconButton>
							</Tooltip>
							<Typography>{p.dislikedBy.length}</Typography>
						</Stack>
					</Stack>
					<Stack direction="row">
						<Tooltip title="Share">
							<IconButton>
								<Share />
							</IconButton>
						</Tooltip>
						<Tooltip title="Add Comment">
							<IconButton onClick={() => setIsCommenting(!isCommenting)}>
								<CommentIcon color={isCommenting ? 'primary' : undefined} />
							</IconButton>
						</Tooltip>
					</Stack>
				</Box>
			</Card>
			<Box pt={2}>
				<Formik
					initialValues={{ commentBody: '' }}
					validationSchema={Yup.object({
						commentBody: Yup.string().required().max(320),
					})}
					onSubmit={(v) => onCommentSubmit(v)}
				>
					<Form>
						{p.commentList.map((v) => (
							<Comment {...v} key={v.uid} />
						))}
						{isCommenting && (
							<Card elevation={4} sx={{ mt: 4 }}>
								<CardHeader
									sx={{ textAlign: 'left', pl: 2 }}
									title={<Typography variant="h6">Add comment</Typography>}
								/>
								<CardContent>
									<TextFieldValidate
										label="What is it about?"
										autoFocus
										name="commentBody"
										multiline
										minRows={3}
										fullWidth
									/>
								</CardContent>
								<CardActions>
									<Button type="submit">Submit</Button>
									<Button
										onClick={() => setIsCommenting(false)}
										type="button"
										color="error"
									>
										Cancel
									</Button>
								</CardActions>
							</Card>
						)}
					</Form>
				</Formik>
			</Box>
		</Container>
	)
}
