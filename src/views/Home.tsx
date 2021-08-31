import {
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	Container,
	Divider,
	ImageList,
	ImageListItem,
	Stack,
} from '@material-ui/core'
import React, { useRef, useState } from 'react'
import { readAsDataURL } from 'promise-file-reader'
import { Form, Formik } from 'formik'
import * as Yup from 'yup'
import { useAppSelector } from '../hooks'
import { Post } from '../components/Post'
import { fire } from '..'
import { PostType, UserType } from '../types'
import { v4 } from 'uuid'
import { TextFieldValidate } from '../components/TextFieldValidate'

const initialValues = {
	postTitle: '',
	postBody: '',
}

export function Home() {
	const posts = useAppSelector((state) => state.posts)
	const users = useAppSelector((state) => state.users)
	const comments = useAppSelector((state) => state.comments)
	const [images, setImages] = useState<string[]>([])
	const inputRef = useRef<HTMLInputElement>(null)
	const currentUserUid = useAppSelector(
		(state) => (state.user.userState as UserType).uid,
	)
	const [isFormOpened, setIsFormOpened] = useState(false)

	async function onInputChange() {
		const fileList = Array.from(inputRef?.current?.files as FileList)
		const listOfPromises = [] as Promise<string>[]

		fileList.forEach((v, i) => {
			listOfPromises.push(readAsDataURL(v))
		})

		setImages(await Promise.all(listOfPromises))
	}
	async function onFormSubmit(values: typeof initialValues) {
		const post: PostType = {
			authorUid: currentUserUid,
			bodyText: values.postBody,
			title: values.postTitle,
			createdAt: new Date().getTime(),
			dislikedBy: [],
			likedBy: [],
			uid: v4(),
			imageUrls: [],
		}

		const putImagesInStorage = async function () {
			const fileList = Array.from(inputRef?.current?.files as FileList)
			const storage = fire.storage()
			if (!fileList.length) return []

			const resolveArr: Promise<string>[] = fileList.map(async (image) => {
				const ref = storage.ref(
					`postImages/${v4()}.${image.name.split('.').pop()}`,
				)
				await ref.put(image)
				return await ref.getDownloadURL()
			})

			return await Promise.all(resolveArr)
		}

		post.imageUrls = await putImagesInStorage()
		await fire.firestore().doc(`posts/${post.uid}`).set(post)
	}

	const postsWithUsers = posts
		.filter((post) => {
			return !!users.find((user) => user.uid === post.authorUid)
		})
		.map((post) => ({
			...post,
			user: users.find((user) => user.uid === post.authorUid)!,
		}))

	function closePostForm(formReset: Function) {
		const ref = inputRef.current as HTMLInputElement
		formReset()
		ref.value = ''
		setImages([])
		setIsFormOpened(false)
	}
	return (
		<>
			<Container>
				<Formik
					initialValues={initialValues}
					validationSchema={Yup.object({
						postTitle: Yup.string().required().max(80),
						postBody: Yup.string().required().min(20).max(700),
					})}
					onSubmit={onFormSubmit}
				>
					{(formik) => (
						<>
							<Form>
								<Card elevation={8}>
									<CardContent sx={{ pb: 0 }}>
										<Stack gap={2}>
											<TextFieldValidate
												onFocus={() => setIsFormOpened(true)}
												name="postTitle"
												variant="outlined"
												fullWidth
												label={isFormOpened ? 'Post Title' : 'Add a new post'}
											/>
											{isFormOpened && (
												<TextFieldValidate
													name="postBody"
													multiline
													minRows={5}
													variant="outlined"
													label="Add post"
													fullWidth
												/>
											)}
										</Stack>

										{isFormOpened && (
											<>
												<ImageList
													cols={2}
													gap={4}
													sx={{ width: '100%', maxHeight: 300 }}
													rowHeight={200}
												>
													{images.map((v, i) => (
														<ImageListItem key={i}>
															<img
																style={{
																	backgroundImage: `url(${v})`,
																	backgroundPosition: 'center',
																	backgroundSize: 'cover',
																}}
															></img>
														</ImageListItem>
													))}
												</ImageList>
												{!!images.length && <Divider />}
											</>
										)}
									</CardContent>
									{isFormOpened && (
										<CardActions>
											<label htmlFor="imagePicker">
												<Button component="span" color="secondary">
													Pick Images
												</Button>
												<input
													ref={inputRef}
													onChange={onInputChange}
													type="file"
													multiple
													accept="image/*"
													style={{ display: 'none' }}
													id="imagePicker"
												/>
											</label>
											<Button
												type="submit"
												onClick={() => closePostForm(formik.resetForm)}
											>
												Post
											</Button>
											<Box sx={{ ml: 'auto' }}>
												<Button
													color="error"
													onClick={() => closePostForm(formik.resetForm)}
												>
													Cancel
												</Button>
											</Box>
										</CardActions>
									)}
								</Card>
							</Form>
						</>
					)}
				</Formik>
			</Container>
			{postsWithUsers.map((post) => (
				<Post
					{...post}
					key={post.uid}
					commentList={comments.filter((v) => v.parentPostUid === post.uid)}
				/>
			))}
		</>
	)
}
