import * as yup from "yup"
import {
	collection,
	getDoc,
	getFirestore,
	onSnapshot,
	query,
	setDoc,
	where,
} from "@firebase/firestore"
import {
	Container,
	Paper,
	List,
	ListItemButton,
	ListItemAvatar,
	ListItemText,
	Divider,
	Fab,
	Icon,
	Dialog,
	AppBar,
	IconButton,
	Typography,
	Toolbar,
	ListItemIcon,
	Button,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	ListItem,
	Checkbox,
	Stack,
	ListSubheader,
} from "@mui/material"
import { TextFieldValidate } from "../components/TextFieldValidate"
import { doc } from "firebase/firestore"
import React, { useEffect, useRef, useState } from "react"
import { useHistory } from "react-router"
import { AppMessage } from "../components/AppMessage"
import { UserAvatarFetch } from "../components/UserAvatar"
import { firebaseApp } from "../firebase"
import { useAppSelector } from "../hooks"
import { chat, GroupMessageRoom, MessageType, UserType } from "../types"
import { Loader } from "./Loader"
import { Formik, Form } from "formik"
import { v4 } from "uuid"
import { ImagePicker } from "../components/ImagePicker"
import { getDownloadURL, getStorage, ref, uploadBytes } from "@firebase/storage"
import { GroupAvatar } from "../components/GroupAvatar"

const db = getFirestore(firebaseApp)
const storage = getStorage(firebaseApp)

export function Messanger() {
	const [messageRooms, setMessageRooms] = useState<chat[] | null>(null)
	const currentUser = useAppSelector((s) => s.user.userState as UserType)
	const [messageRoomList, setMessageRoomList] =
		useState<Array<JSX.Element | null> | null>(null)
	const [dialogOpen, setDialogOpen] = useState(false)
	const [newGroupDialogOpen, setNewGroupDialogOpen] = useState(false)
	const [friendList, setFriendList] = useState<UserType[]>([])
	const [checked, setChecked] = useState([0])

	const { push } = useHistory()
	const imageInputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (!currentUser) return

		const promiseArr: Promise<UserType>[] = currentUser.friendList.map(
			async (friendId) => {
				const snapshot = await getDoc(doc(db, `users/${friendId}`))
				if (!snapshot.exists) throw new Error("User doesn't exist")
				return snapshot.data() as UserType
			}
		)
		Promise.all(promiseArr).then((result) => setFriendList(result))
	}, [currentUser])

	useEffect(() => {
		if (!messageRooms) return

		const promiseArr = messageRooms.map(async (room, i) => {
			let chatImage: JSX.Element
			let chatName: string

			if (room.type === "dialog") {
				const friendId = Object.keys(room.members).filter(
					(uid) => uid !== currentUser.uid
				)[0]
				const companion = (
					await getDoc(doc(db, `users/${friendId}`))
				).data() as UserType
				chatName = companion.firstName + " " + companion.secondName
				chatImage = <UserAvatarFetch uid={friendId} />
			} else {
				chatName = room.title
				chatImage = <GroupAvatar {...room} />
			}
			const latestMessage = room.messages.sort(
				(msgA, msgB) => msgB.createdAt - msgA.createdAt
			)[0] as MessageType | undefined

			return (
				<React.Fragment key={room.uid}>
					<ListItemButton onClick={() => push(`messanger/${room.uid}`)}>
						<ListItemAvatar>{chatImage}</ListItemAvatar>
						<ListItemText
							primary={chatName}
							secondary={latestMessage ? latestMessage.text : null}
						></ListItemText>
					</ListItemButton>
					{i + 1 !== messageRooms.length && <Divider />}
				</React.Fragment>
			)
		})

		Promise.all(promiseArr).then((res) => setMessageRoomList(res))
	}, [currentUser.uid, messageRooms, push])

	useEffect(() => {
		const q = query(
			collection(db, "messanger"),
			where(`members.${currentUser.uid}`, "==", true)
		)
		const unsub = onSnapshot(q, (snapshot) => {
			setMessageRooms(snapshot.docs.map((res) => res.data() as chat))
		})

		return unsub
	}, [currentUser.uid])

	if (!messageRooms) {
		return <Loader />
	}

	const initialValues = {
		groupTitle: "",
		groupDescription: "",
	}

	const createGroup = async (v: typeof initialValues) => {
		const group: GroupMessageRoom = {
			type: "group",
			createdAt: new Date().getTime(),
			members: { [currentUser.uid]: true },
			messages: [],
			owner: currentUser.uid,
			title: v.groupTitle,
			uid: v4(),
			description: v.groupDescription,
		}
		!v.groupDescription && delete group.description

		const checkedMembers = checked.map((index) => friendList[index])
		checkedMembers.forEach((member) => {
			group.members[member.uid] = true
		})

		if (
			imageInputRef.current &&
			imageInputRef.current.files &&
			imageInputRef.current.files[0]
		) {
			const extension = imageInputRef.current.files[0].name.split(".").pop()
			const path = `groupImages/${group.uid}.${extension}`
			const result = await uploadBytes(
				ref(storage, path),
				imageInputRef.current.files[0]
			)
			group.photoUrl = await getDownloadURL(result.ref)
		}

		debugger

		await setDoc(doc(db, `messanger/${group.uid}`), group)
		push(`messanger/${group.uid}`)
	}

	const handleToggle = (value: number) => () => {
		const currentIndex = checked.indexOf(value)
		const newChecked = [...checked]

		if (currentIndex === -1) {
			newChecked.push(value)
		} else {
			newChecked.splice(currentIndex, 1)
		}

		setChecked(newChecked)
	}

	const fab = (
		<Fab
			sx={{ position: "absolute", right: "16px", bottom: "16px" }}
			color="primary"
			onClick={() => setDialogOpen(true)}
		>
			<Icon>add</Icon>
		</Fab>
	)

	const dialog = (
		<Dialog open={dialogOpen} fullScreen>
			<Dialog open={newGroupDialogOpen}>
				<DialogTitle>Create new group</DialogTitle>
				<Formik
					initialValues={initialValues}
					validationSchema={yup.object({
						groupTitle: yup.string().required(),
						groupDescription: yup.string().notRequired().min(10),
					})}
					onSubmit={(values) => createGroup(values)}
				>
					<Form>
						<DialogContent>
							<DialogContentText>
								Pick a good name and description for your group
							</DialogContentText>
							<TextFieldValidate
								name="groupTitle"
								margin="normal"
								label="Group title"
								fullWidth
							/>
							<TextFieldValidate
								name="groupDescription"
								margin="normal"
								label="Group description (optional)"
								multiline
								minRows={2}
								fullWidth
							/>
							<ImagePicker
								title="Pick a group image"
								widthAndHeight={60}
								inputRef={imageInputRef}
							/>
						</DialogContent>
						<List
							sx={{ px: 2 }}
							subheader={<ListSubheader>Pick members</ListSubheader>}
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
													checked={checked.indexOf(index) !== -1}
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
													<UserAvatarFetch uid={friend.uid} />
													{friend.firstName + " " + friend.secondName}
												</Stack>
											</ListItemText>
										</ListItemButton>
									</ListItem>
								)
							})}
						</List>
						<DialogActions>
							<Button
								onClick={() => setNewGroupDialogOpen(false)}
								color="error"
							>
								Cancel
							</Button>
							<Button type="submit">Submit</Button>
						</DialogActions>
					</Form>
				</Formik>
			</Dialog>
			<AppBar position="sticky">
				<Toolbar>
					<IconButton
						edge="start"
						onClick={() => setDialogOpen(false)}
						color="default"
					>
						<Icon sx={{ color: "white" }}>close</Icon>
					</IconButton>
					<Typography variant="h6">Start conversation</Typography>
				</Toolbar>
			</AppBar>

			<Container>
				<Paper>
					<List>
						<ListItemButton onClick={() => null}>
							<ListItemIcon>
								<Icon>group_add</Icon>
							</ListItemIcon>
							<ListItemText onClick={() => setNewGroupDialogOpen(true)}>
								Create a new group
							</ListItemText>
						</ListItemButton>
						<Divider />
						{friendList.map((friend) => (
							<ListItemButton
								key={friend.uid}
								// onClick={() =>
								// 	onDialogSelect(currentUser.uid, friend.uid, (path) =>
								// 		push(path)
								// 	)
								// }
							>
								<ListItemAvatar>
									<UserAvatarFetch uid={friend.uid} />
								</ListItemAvatar>
								<ListItemText>
									{friend.firstName + " " + friend.secondName}
								</ListItemText>
							</ListItemButton>
						))}
					</List>
				</Paper>
			</Container>
		</Dialog>
	)

	if (!messageRooms.length) {
		return (
			<>
				{dialog}
				<AppMessage text="It seems to be empty, how is that??" />
				{fab}
			</>
		)
	}

	return (
		<>
			{dialog}
			<Container>
				<Paper elevation={4}>
					<List>{messageRoomList}</List>
				</Paper>
			</Container>
			{fab}
		</>
	)
}
