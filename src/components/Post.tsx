import * as Yup from "yup"
import {
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	CardHeader,
	Container,
	Divider,
	Icon,
	IconButton,
	ImageList,
	ImageListItem,
	Stack,
	Tooltip,
	Typography,
} from "@mui/material"
import { Form, Formik } from "formik"
import { Comment } from "./Comment"
import { TextFieldValidate } from "./TextFieldValidate"
import { useEffect, useState } from "react"
import { CommentType, PostType, UserType } from "../types"
import { v4 } from "uuid"
import { useAppSelector } from "../hooks"
import { UserAvatarFetch } from "./UserAvatar"
import { firebaseApp } from "../firebase"
import {
	getFirestore,
	doc,
	updateDoc,
	arrayRemove,
	arrayUnion,
	setDoc,
	onSnapshot,
	query,
	where,
	collection,
} from "firebase/firestore"
import { useUserById } from "../hooks/useUserById"

const db = getFirestore(firebaseApp)

interface Props extends PostType {
	paddingNotNeeded?: true
}

export function Post(p: Props) {
	const [isCommenting, setIsCommenting] = useState(false)
	const currentUser = useAppSelector((s) => s.user.userState as UserType)
	const postUser = useUserById(p.authorUid)
	const [comments, setComments] = useState<CommentType[]>([])

	useEffect(() => {
		const q = query(
			collection(db, "comments"),
			where("parentPostUid", "==", p.uid)
		)
		onSnapshot(q, (snap) => {
			setComments(snap.docs.map((doc) => doc.data() as CommentType))
		})
	}, [p.uid])

	function onLike(isLike: boolean = true) {
		const property = isLike ? "likedBy" : "dislikedBy"

		if (p[property].find((v) => v === currentUser.uid)) return

		const postRef = `posts/${p.uid}`

		updateDoc(doc(db, postRef), {
			[isLike ? "dislikedBy" : "likedBy"]: arrayRemove(currentUser.uid),
		})

		updateDoc(doc(db, postRef), { [property]: arrayUnion(currentUser.uid) })
	}

	if (!postUser) return null

	return (
		<Container sx={{ mt: 2 }}>
			<Card elevation={4}>
				<CardHeader
					title={<Typography variant="subtitle1">{p.title}</Typography>}
					subheader={`By ${postUser.firstName} ${postUser.secondName}`}
					avatar={
						<UserAvatarFetch
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
						variant={p.imageUrls.length > 4 ? "masonry" : "standard"}
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
				<Box sx={{ display: "flex", justifyContent: "space-between", p: 1 }}>
					<Stack direction="row">
						<Stack direction="row" sx={{ alignItems: "center" }}>
							<Tooltip title="Like">
								<IconButton
									color={
										p.likedBy.includes(currentUser.uid) ? "primary" : "default"
									}
									onClick={() => onLike(true)}
								>
									<Icon>thumb_up</Icon>
								</IconButton>
							</Tooltip>
							<Typography>{p.likedBy.length}</Typography>
						</Stack>
						<Stack direction="row" sx={{ alignItems: "center" }}>
							<Tooltip title="Dislike">
								<IconButton
									color={
										p.dislikedBy.includes(currentUser.uid) ? "error" : "default"
									}
									onClick={() => onLike(false)}
								>
									<Icon>thumb_down</Icon>
								</IconButton>
							</Tooltip>
							<Typography>{p.dislikedBy.length}</Typography>
						</Stack>
					</Stack>

					<Stack direction="row">
						<Tooltip title="Share">
							<IconButton>
								<Icon>share</Icon>
							</IconButton>
						</Tooltip>
						<Tooltip title="Add Comment">
							<IconButton onClick={() => setIsCommenting(!isCommenting)}>
								<Icon color={isCommenting ? "primary" : undefined}>
									comment-icon
								</Icon>
							</IconButton>
						</Tooltip>
					</Stack>
				</Box>
			</Card>

			<Box pt={2}>
				<Formik
					initialValues={{ commentBody: "" }}
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
							{comments.map((v) => (
								<Comment
									onReplyClick={(user) => {
										setTimeout(() =>
											formik.setFieldValue(
												"commentBody",
												`${user.firstName} ${user.secondName}, `
											)
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
										sx={{ textAlign: "left", pl: 2 }}
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
