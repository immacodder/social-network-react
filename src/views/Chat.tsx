import { doc, getFirestore } from "@firebase/firestore"
import { AppBar, Container, Stack, TextField, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { v4 } from "uuid"
import { Message } from "../components/Message"
import { UserAvatarFetch } from "../components/UserAvatar"
import { firebaseApp } from "../firebase"
import { useAppSelector } from "../hooks"
import { DialogMessageRoom, MessageType, UserType, chat } from "../types"
import { Loader } from "./Loader"
import { onSnapshot, updateDoc, arrayUnion } from "firebase/firestore"
import { MessangerGroupAvatar } from "../components/MessangerGroupAvatar"

const db = getFirestore(firebaseApp)

interface Props {
	messangerRoomId: string
}

const scrollHeight = Math.max(
	document.body.scrollHeight,
	document.documentElement.scrollHeight,
	document.body.offsetHeight,
	document.documentElement.offsetHeight,
	document.body.clientHeight,
	document.documentElement.clientHeight
)

export function Chat({ messangerRoomId }: Props) {
	const currentUser = useAppSelector((s) => s.user.userState as UserType)
	const [text, setText] = useState("")
	const [companion, setCompanion] = useState<null | UserType>(null)
	const [chatInfo, setChatInfo] = useState<null | chat>(null)
	const [companionId, setCompanionId] = useState<string>("")

	useEffect(() => {
		if (!chatInfo || !chatInfo.messages.length) return
		const pixelsFromBottom =
			scrollHeight - (scrollY + document.documentElement.clientHeight)
		console.log(pixelsFromBottom)

		const messageCreatedByCurrentUser =
			chatInfo.messages.sort((m1, m2) => m2.createdAt - m1.createdAt)[0]
				.createdBy === currentUser.uid

		if (pixelsFromBottom <= 100 || messageCreatedByCurrentUser) {
			// make sure that I only scroll after message has been rendered
			setTimeout(() => scrollBy(0, 1e9), 50)
		}
	}, [chatInfo, currentUser.uid])

	useEffect(() => {
		const unsub = onSnapshot(
			doc(db, `messanger/${messangerRoomId}`),
			(snapshot) => {
				const data = snapshot.data() as DialogMessageRoom
				setChatInfo(data)
				if (data.type === "dialog") {
					setCompanionId(
						Object.keys(data.members).filter((v) => v !== currentUser.uid)[0]
					)
				}
			}
		)
		return unsub
	}, [messangerRoomId, currentUser.uid])

	useEffect(() => {
		if (!companionId) return
		const unsub = onSnapshot(doc(db, `users/${companionId}`), (snapshot) => {
			setCompanion(snapshot.data() as UserType)
		})
		return unsub
	}, [companionId])

	async function onMessageSent() {
		const message: MessageType = {
			imageUrls: [],
			roomId: messangerRoomId,
			text,
			createdAt: new Date().getTime(),
			uid: v4(),
			isRead: false,
			createdBy: currentUser.uid,
		}
		if (text)
			updateDoc(doc(db, `messanger/${messangerRoomId}`), {
				messages: arrayUnion(message),
			})
		setText("")
	}

	if (!chatInfo || (chatInfo.type === "dialog" && !companion)) {
		return <Loader />
	}

	let chatPicture: JSX.Element
	let chatName: string

	if (chatInfo.type === "dialog") {
		chatPicture = <UserAvatarFetch uid={companion!.uid} />
		chatName = companion?.firstName + " " + companion?.secondName
	} else {
		chatPicture = <MessangerGroupAvatar {...chatInfo} />
		chatName = chatInfo.title
	}

	return (
		<>
			{/* <button onClick={()=>useScrol}></button> */}
			<AppBar position="sticky">
				<Container sx={{ py: 1 }}>
					<Stack
						sx={{ display: "flex", alignItems: "center" }}
						direction="row"
						gap={1}
					>
						{chatPicture}
						<Stack>
							<Typography fontSize={18}>{chatName}</Typography>
							<Typography fontSize={12}>
								{"last seen today, just like that"}
							</Typography>
						</Stack>
					</Stack>
				</Container>
			</AppBar>
			<Container sx={{ mb: 8 }}>
				<Stack sx={{ mt: 2 }} rowGap={2}>
					{chatInfo.messages.map((message) => {
						return (
							<Message
								message={message}
								messageRoomType={chatInfo.type}
								type={
									message.createdBy === currentUser.uid ? "sended" : "received"
								}
								key={message.uid}
							/>
						)
					})}
				</Stack>
			</Container>
			<form
				style={{
					position: "fixed",
					width: "100%",
					bottom: 0,
					// padding: "0 24px 0 24px",
				}}
				onSubmit={(e) => {
					e.preventDefault()
					onMessageSent()
				}}
			>
				<TextField
					value={text}
					onChange={(e) => setText(e.target.value)}
					fullWidth
					variant="outlined"
					sx={{ backgroundColor: "white" }}
					placeholder="Type here..."
				/>
			</form>
		</>
	)
}
