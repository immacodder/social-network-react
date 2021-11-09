import {
	collection,
	getFirestore,
	onSnapshot,
	query,
	setDoc,
	where,
} from "@firebase/firestore"
import {
	Avatar,
	Box,
	Button,
	Card,
	Checkbox,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Fab,
	Icon,
	List,
	ListItem,
	ListItemAvatar,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	ListSubheader,
	Stack,
	Typography,
} from "@mui/material"
import { Formik, Form } from "formik"
import { useEffect, useRef, useState } from "react"
import { useHistory } from "react-router"
import { AppMessage } from "../components/AppMessage"
import { ImagePickerAvatar } from "../components/ImagePickerAvatar"
import { TextFieldValidate } from "../components/TextFieldValidate"
import { UserAvatarRender } from "../components/UserAvatar"
import { firebaseApp } from "../firebase"
import { useAppSelector } from "../hooks"
import { UserType, Group } from "../types"
import { Loader } from "./Loader"
import * as yup from "yup"
import { getDoc, doc } from "firebase/firestore"
import { useImagePicker } from "../hooks/useImagePicker"
import { getDownloadURL, getStorage, ref, uploadBytes } from "@firebase/storage"
import { v4 } from "uuid"

const db = getFirestore(firebaseApp)
const storage = getStorage(firebaseApp)

export function Groups() {
	const [groups, setGroups] = useState<Group[] | null>(null)
	const currentUser = useAppSelector((s) => s.user.userState as UserType)
	const [dialogOpen, setDialogOpen] = useState(false)
	const [checkedFriends, setCheckedFriends] = useState([0])
	const coverImageInputRef = useRef<HTMLInputElement>(null)
	const profileImageInputRef = useRef<HTMLInputElement>(null)
	const [friendList, setFriendList] = useState<UserType[]>([])
	const { imagePreview, onClearClick, onFileInputChange } = useImagePicker({
		inputRef: coverImageInputRef,
	})
	const { push } = useHistory()

	useEffect(() => {
		const q = query(
			collection(db, "groups"),
			where("members", "array-contains", currentUser.uid)
		)
		const unsub = onSnapshot(q, (snap) =>
			setGroups(snap.docs.map((doc) => doc.data() as Group))
		)

		return unsub
	}, [currentUser.uid])

	useEffect(() => {
		const promiseArr: Promise<UserType>[] = currentUser.friendList.map(
			async (friendId) => {
				const snapshot = await getDoc(doc(db, `users/${friendId}`))
				if (!snapshot.exists) throw new Error("User doesn't exist")
				return snapshot.data() as UserType
			}
		)
		Promise.all(promiseArr).then((result) => setFriendList(result))
	}, [currentUser])

	if (!groups) return <Loader />

	const initialValues = {
		title: "",
		description: "",
	}

	const fab = (
		<Fab
			color="secondary"
			sx={{ position: "absolute", bottom: "16px", right: "16px" }}
			onClick={() => setDialogOpen(true)}
		>
			<Icon>add</Icon>
		</Fab>
	)

	const handleToggle = (value: number) => () => {
		const currentIndex = checkedFriends.indexOf(value)
		const newChecked = [...checkedFriends]

		if (currentIndex === -1) {
			newChecked.push(value)
		} else {
			newChecked.splice(currentIndex, 1)
		}

		setCheckedFriends(newChecked)
	}

	const createGroup = async ({ title, description }: typeof initialValues) => {
		const additionalMembers = checkedFriends.map((v) => friendList[v].uid)

		const { coverImageURL, profileImageURL } = await uploadAndGetImageURLs()

		const group: Group = {
			coverImage: coverImageURL,
			profileImage: profileImageURL,
			createdAt: new Date().getTime(),
			description,
			title,
			id: v4(),
			members: [currentUser.uid].concat(additionalMembers),
			owner: currentUser.uid,
		}

		await setDoc(doc(db, `groups/${group.id}`), group)
		push(`group/${group.id}`)

		async function uploadAndGetImageURLs() {
			const coverImageBlob = coverImageInputRef.current!.files![0]
			const profileImageBlob = profileImageInputRef.current!.files![0]
			if (!coverImageBlob || !profileImageBlob) throw new Error("No images")

			const coverImageRef = ref(
				storage,
				`groups/${v4()}.${coverImageBlob.name.split(".").pop()}`
			)
			const profileImageRef = ref(
				storage,
				`groups/${v4()}.${profileImageBlob.name.split(".").pop()}`
			)

			await uploadBytes(coverImageRef, coverImageBlob)
			await uploadBytes(profileImageRef, profileImageBlob)

			const coverImageURL = await getDownloadURL(coverImageRef)
			const profileImageURL = await getDownloadURL(profileImageRef)

			return { coverImageURL, profileImageURL }
		}
	}

	const dialog = (
		<>
			<Dialog fullScreen open={dialogOpen}>
				<DialogTitle sx={{ mt: 2, pb: 0 }}>Create new group</DialogTitle>
				<Formik
					initialValues={initialValues}
					validationSchema={yup.object({
						title: yup.string().required().min(2),
						description: yup.string().required().min(15),
					})}
					onSubmit={(values) => createGroup(values)}
				>
					<Form>
						<DialogContent>
							<Stack gap={2}>
								<DialogContentText>
									Pick a good name and description for your group
								</DialogContentText>
								<TextFieldValidate name="title" label="Group title" fullWidth />
								<TextFieldValidate
									name="description"
									label="Group description"
									multiline
									minRows={2}
									fullWidth
								/>

								<ImagePickerAvatar
									title="Pick a group image"
									widthAndHeight={80}
									inputRef={profileImageInputRef}
								/>

								{/* Image picker for cover */}
								<>
									{imagePreview && (
										<Box
											component="div"
											sx={{
												mr: 1,
												width: "100%",
												height: 200,
												backgroundImage: `url( ${imagePreview} )`,
												backgroundSize: "cover",
												backgroundPosition: "center",
											}}
										/>
									)}
									<label htmlFor="coverImagePicker">
										<Stack direction="row" sx={{ mb: 2 }}>
											<Button component="span">Pick a group cover image</Button>
											{imagePreview && (
												<Button
													component="span"
													onClick={(e: any) => onClearClick(e)}
													color="error"
												>
													Clear
												</Button>
											)}
										</Stack>
										<input
											type="file"
											accept="image/*"
											ref={coverImageInputRef}
											onChange={onFileInputChange}
											style={{ display: "none" }}
											id="coverImagePicker"
										/>
									</label>
								</>
							</Stack>
						</DialogContent>
						<List
							sx={{ px: 2 }}
							subheader={<ListSubheader>Invite friends</ListSubheader>}
						>
							{friendList.map((friend, index) => {
								return (
									<ListItem key={friend.uid} disablePadding>
										<ListItemButton
											role={undefined}
											onClick={handleToggle(index)}
											dense
										>
											<ListItemIcon>
												<Checkbox
													edge="start"
													checked={checkedFriends.indexOf(index) !== -1}
													tabIndex={-1}
													disableRipple
												/>
											</ListItemIcon>
											<ListItemText>
												<Stack
													direction="row"
													sx={{ alignItems: "center" }}
													gap={2}
												>
													<UserAvatarRender user={friend} />
													{friend.firstName + " " + friend.secondName}
												</Stack>
											</ListItemText>
										</ListItemButton>
									</ListItem>
								)
							})}
						</List>
						<DialogActions>
							<Button onClick={() => setDialogOpen(false)} color="error">
								Cancel
							</Button>
							<Button type="submit">Submit</Button>
						</DialogActions>
					</Form>
				</Formik>
			</Dialog>
		</>
	)

	if (!groups.length)
		return (
			<>
				{dialog}
				<AppMessage text="Don't wanna participate? Come on now" />
				{fab}
			</>
		)

	return (
		<>
			{dialog}
			<Container>
				<Card>
					<Typography sx={{ ml: 2, mt: 2 }} variant="h5">
						Groups
					</Typography>
					<List>
						{groups.map((group) => {
							return (
								<ListItemButton
									key={group.id}
									onClick={() => push(`/group/${group.id}`)}
								>
									<ListItemAvatar sx={{ mr: 2 }}>
										<Avatar
											sx={{ width: "64px", height: "64px" }}
											src={group.profileImage || undefined}
										>
											{group.title.slice(0, 2)}
										</Avatar>
									</ListItemAvatar>
									<ListItemText
										primary={group.title}
										secondary={group.description}
									/>
								</ListItemButton>
							)
						})}
					</List>
				</Card>
			</Container>
			{fab}
		</>
	)
}
