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
} from "@mui/material"
import React, { useEffect, useRef, useState } from "react"
import { readAsDataURL } from "promise-file-reader"
import { Form, Formik } from "formik"
import * as Yup from "yup"
import { useAppSelector } from "../hooks"
import { Post } from "../components/Post"
import type { PostType, UserType } from "../types"
import { v4 } from "uuid"
import { TextFieldValidate } from "../components/TextFieldValidate"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import {
	getFirestore,
	doc,
	setDoc,
	collection,
	onSnapshot,
	query,
} from "firebase/firestore"

const storage = getStorage()
const db = getFirestore()

const initialValues = {
	postTitle: "",
	postBody: "",
}

export function Home() {
	const [posts, setPosts] = useState<PostType[]>([])
	const [images, setImages] = useState<string[]>([])
	const inputRef = useRef<HTMLInputElement>(null)
	const currentUserUid = useAppSelector(
		(state) => (state.user.userState as UserType).uid
	)
	const [isFormOpened, setIsFormOpened] = useState(false)

	useEffect(
		() =>
			onSnapshot(query(collection(db, "posts")), (snapshot) => {
				setPosts(snapshot.docs.map((doc) => doc.data() as PostType))
			}),
		[]
	)

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
			if (!fileList.length) return []
			/// FUCK YOU FUCK YOU FUCK YOU FUCK YOU I HATE MY LIFE WHY DOES THIS NOT WORKKK
			const resolveArr: Promise<string>[] = fileList.map(async (image) => {
				const refPath = `postImages/${v4()}.${image.name.split(".").pop()}`
				const postImageRef = ref(storage, refPath)
				await uploadBytes(postImageRef, image)
				return getDownloadURL(postImageRef)
			})

			async function resolveSequantially() {
				const tempArr: string[] = []
				console.log("is this even running?")
				for (let i = 0; i < resolveArr.length; i++) {
					console.log("???")
					const result = await resolveArr[i]
					console.log(result)
					tempArr.push(result)
				}
				return tempArr
			}

			const result = await resolveSequantially()

			return result
		}

		post.imageUrls = await putImagesInStorage()
		const result = await setDoc(doc(db, `posts/${post.uid}`), post)
		console.log(result)
	}

	const closePostForm = (formReset: Function) =>
		setTimeout(() => {
			const ref = inputRef.current as HTMLInputElement
			formReset()
			ref.value = ""
			setImages([])
			setIsFormOpened(false)
		}, 0)

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
								<Card elevation={8} sx={{ mb: 4 }}>
									<CardContent sx={{ pb: 0 }}>
										<Stack gap={2}>
											<TextFieldValidate
												onFocus={() => setIsFormOpened(true)}
												name="postTitle"
												variant="outlined"
												fullWidth
												label={isFormOpened ? "Post Title" : "Add a new post"}
											/>
											{isFormOpened && (
												<TextFieldValidate
													name="postBody"
													multiline
													minRows={5}
													variant="outlined"
													label="Post Body"
													fullWidth
												/>
											)}
										</Stack>

										{isFormOpened && (
											<>
												<ImageList
													cols={2}
													gap={4}
													sx={{ width: "100%", maxHeight: 300 }}
													rowHeight={200}
												>
													{images.map((v, i) => (
														<ImageListItem key={i}>
															<img
																style={{
																	backgroundImage: `url(${v})`,
																	backgroundPosition: "center",
																	backgroundSize: "cover",
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
													style={{ display: "none" }}
													id="imagePicker"
												/>
											</label>
											<Button
												type="submit"
												onClick={() => closePostForm(formik.resetForm)}
											>
												Post
											</Button>

											<Box sx={{ ml: "auto" }}>
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
			<Box mb={8}>
				{posts.map((post) => (
					<Post key={post.uid} {...post} />
				))}
			</Box>
		</>
	)
}
