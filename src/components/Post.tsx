import * as Yup from 'yup'
import {
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
import { useState } from 'react'
import { CommentType, PostType, UserType } from '../types'
import { v4 } from 'uuid'
import { useAppSelector } from '../hooks'
import { UserAvatar } from './UserAvatar'
import { firebaseApp } from '../firebase'
import {
	getFirestore,
	doc,
	updateDoc,
	arrayRemove,
	arrayUnion,
	setDoc,
} from 'firebase/firestore'
import { useUserById } from '../hooks/useUserById'

const db = getFirestore(firebaseApp)

export function Post(p: PostType) {
	const [isCommenting, setIsCommenting] = useState(false)
	const currentUser = useAppSelector((s) => s.user.userState as UserType)
	const postUser = useUserById(p.authorUid)
	const comments = useAppSelector((state) => state.comments)
	const commentList = comments.filter((v) => v.parentPostUid === p.uid)

	function onLike(isLike: boolean = true) {
		const property = isLike ? 'likedBy' : 'dislikedBy'

		if (p[property].find((v) => v === currentUser.uid)) return

		const postRef = `posts/${p.uid}`

		updateDoc(doc(db, postRef), {
			[isLike ? 'dislikedBy' : 'likedBy']: arrayRemove(currentUser.uid),
		})

		updateDoc(doc(db, postRef), { [property]: arrayUnion(currentUser.uid) })
	}

	if (!postUser) return null

	return (
		<Container sx={{ mt: 2}}>
			<Card elevation={4}>
				<CardHeader
					title={<Typography variant="subtitle1">{p.title}</Typography>}
					subheader={`By ${postUser.firstName} ${postUser.secondName}`}
					avatar={
						<UserAvatar
							redirect
							uid={postUser.uid}
							sx={{ width: 48, height: 48 }}
						/>
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
									color={
										p.likedBy.includes(currentUser.uid) ? 'primary' : 'default'
									}
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
										p.dislikedBy.includes(currentUser.uid) ? 'error' : 'default'
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
					onSubmit={({ commentBody }, { resetForm }) => {
						setIsCommenting(false)
						const uid = v4()
						const comment: CommentType = {
							authorUid: currentUser.uid,
							bodyText: commentBody,
							dislikedBy: [],
							likedBy: [],
							parentPostUid: p.uid,
							uid,
							createdAt: new Date().getTime(),
						}
						resetForm()
						setDoc(doc(db, `comments/${uid}`), comment)
					}}
				>
					{(formik) => (
						<Form>
							{commentList.map((v) => (
								<Comment
									onReplyClick={(user) => {
										setTimeout(() =>
											formik.setFieldValue(
												'commentBody',
												`${user.firstName} ${user.secondName}, `,
											),
										)
										setIsCommenting(true)
									}}
									{...v}
									key={v.uid}
								/>
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
											onClick={() => {
												setIsCommenting(false)
												formik.resetForm()
											}}
											type="button"
											color="error"
										>
											Cancel
										</Button>
									</CardActions>
								</Card>
							)}
						</Form>
					)}
				</Formik>
			</Box>
		</Container>
	)
}
