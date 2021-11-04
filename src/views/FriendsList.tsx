import { doc, getDoc, getFirestore } from "@firebase/firestore"
import {
	Container,
	Divider,
	List,
	ListItemAvatar,
	ListItemButton,
	ListItemText,
	Paper,
} from "@mui/material"
import { getDocs, query, collection, where, setDoc } from "firebase/firestore"
import React, { useEffect, useState } from "react"
import { useHistory } from "react-router"
import { v4 } from "uuid"
import { AppMessage } from "../components/AppMessage"
import { UserAvatarFetch } from "../components/UserAvatar"
import { firebaseApp } from "../firebase"
import { useAppSelector } from "../hooks"
import { DialogMessageRoom, UserType } from "../types"
import { Loader } from "./Loader"

const db = getFirestore(firebaseApp)

export function Friends() {
	const currentUser = useAppSelector((s) => s.user.userState as UserType)
	const [friendList, setFriendList] = useState<UserType[] | null>(null)
	const { push } = useHistory()

	useEffect(() => {
		const promiseArr: Promise<UserType>[] = currentUser.friendList.map(
			async (friend) => {
				const promise = (
					await getDoc(doc(db, `users/${friend}`))
				).data() as UserType
				return promise
			}
		)

		Promise.all(promiseArr).then((res) => {
			setFriendList(res)
		})
	}, [currentUser.friendList])

	if (!friendList) {
		return <Loader />
	}

	if (!friendList.length) {
		return <AppMessage text="You should really friend somebody..." />
	}

	const onDialogSelect = async (
		currentUserId: string,
		interlocutorId: string,
		push: (path: string) => void
	) => {
		const result = await getDocs(
			query(
				collection(db, "messanger"),
				where("type", "==", "dialog"),
				where(`members.${currentUserId}`, "==", true),
				where(`members.${interlocutorId}`, "==", true)
			)
		)

		if (result.docs[0]) {
			push(`messanger/${(result.docs[0].data() as DialogMessageRoom).uid}`)
			return
		}

		const messageRoom: DialogMessageRoom = {
			type: "dialog",
			createdAt: new Date().getTime(),
			members: { [interlocutorId]: true, [currentUserId]: true },
			messages: [],
			uid: v4(),
		}

		await setDoc(doc(db, `messanger/${messageRoom.uid}`), messageRoom)
		push(`/messanger/${messageRoom.uid}`)
	}

	return (
		<Container>
			<Paper elevation={4}>
				<List>
					{friendList.map((friend, i) => {
						return (
							<React.Fragment key={friend.uid}>
								<ListItemButton
									onClick={() =>
										onDialogSelect(currentUser.uid, friend.uid, (path) =>
											push(path)
										)
									}
								>
									<ListItemAvatar>
										<UserAvatarFetch uid={friend.uid} redirect />
									</ListItemAvatar>
									<ListItemText
										primary={friend.firstName + " " + friend.secondName}
										secondary={
											"Hello, how ya doing? I love typing stuff out like that that love it"
										}
									></ListItemText>
								</ListItemButton>
								{i + 1 !== friendList.length && <Divider />}
							</React.Fragment>
						)
					})}
				</List>
			</Paper>
		</Container>
	)
}
