import {
	arrayRemove,
	collection,
	getDocs,
	getFirestore,
	query,
	setDoc,
	updateDoc,
	where,
} from "@firebase/firestore"
import {
	Box,
	Button,
	Card,
	CardContent,
	Container,
	Icon,
	Stack,
	Typography,
} from "@mui/material"
import { format } from "date-fns"
import { doc } from "firebase/firestore"
import { useHistory } from "react-router"
import { v4 } from "uuid"
import { Post } from "../components/Post"
import { UserAvatarFetch } from "../components/UserAvatar"
import { firebaseApp } from "../firebase"
import { useAppSelector } from "../hooks"
import { usePosts } from "../hooks/usePosts"
import { useUserById } from "../hooks/useUserById"
import {
	UserType,
	FriendRequest,
	UnfriendRequest,
	DialogMessageRoom,
} from "../types"
import { Loader } from "./Loader"

const db = getFirestore(firebaseApp)

interface Props {
	uid: string
	isCurrentUser?: true
}

export function UserPage(p: Props) {
	const user = useUserById(p.uid)
	const posts = usePosts(p.uid)
	const currentUser = useAppSelector((s) => s.user.userState as UserType)
	const { push } = useHistory()

	if (!user) return <Loader />

	const userPosts = posts.map((post) => <Post {...post} key={post.uid} />)

	async function onFriendRequest(unfriend?: true) {
		const notification: FriendRequest | UnfriendRequest = {
			uid: v4(),
			type: unfriend ? "unfriendRequest" : "friendRequest",
			sender: currentUser,
			receiver: user!.uid,
		}
		if (unfriend) {
			updateDoc(doc(db, `users/${currentUser.uid}`), {
				friendList: arrayRemove(user!.uid),
			})
			updateDoc(doc(db, `users/${user!.uid}`), {
				friendList: arrayRemove(currentUser.uid),
			})
		}

		setDoc(doc(db, `notifications/${notification.uid}`), notification)
	}

	const onChatButtonClick = async () => {
		const snapshots = await getDocs(
			query(
				collection(db, "messanger"),
				where("type", "==", "dialog"),
				where(`members.${currentUser.uid}`, "==", true),
				where(`members.${user.uid}`, "==", true)
			)
		)
		const res = snapshots.docs[0].data() as DialogMessageRoom
		push(`/messanger/${res.uid}`)
	}

	const isUserFriend = currentUser.friendList.includes(user.uid)

	return (
		<>
			<Container>
				<Card elevation={8}>
					<CardContent>
						<Stack sx={{ textAlign: "center", alignItems: "center" }} gap={2}>
							<UserAvatarFetch
								uid={user.uid}
								sx={{ mx: "auto", height: "100px", width: "100px" }}
							/>
							<Typography variant="h5">{`${user.firstName} ${user.secondName}`}</Typography>
							<Stack direction="row" gap={1}>
								<Icon sx={{ color: "text.secondary" }}>today</Icon>
								<Typography variant="body1" sx={{ color: "text.secondary" }}>
									{format(user.dateOfBirth, `MMMM do yyyy`)}
								</Typography>
							</Stack>
							{!p.isCurrentUser && (
								<Stack direction="row">
									<Button
										onClick={() => onFriendRequest(isUserFriend || undefined)}
										startIcon={<Icon>person_add</Icon>}
										color="primary"
									>
										{isUserFriend ? "unfriend" : "Friend"}
									</Button>
									<Button
										startIcon={<Icon>chat</Icon>}
										onClick={() => onChatButtonClick()}
										color="secondary"
									>
										Chat
									</Button>
								</Stack>
							)}
							{user.biography ? (
								<Box>
									<Typography variant="h6" sx={{ mb: 1 }}>
										About me
									</Typography>
									<Typography variant="body2">{user.biography}</Typography>
								</Box>
							) : (
								<Typography>This user prefers to keep it secret</Typography>
							)}
						</Stack>
					</CardContent>
				</Card>
			</Container>
			{userPosts.length ? (
				userPosts
			) : (
				<Box mt={4} display="flex" alignItems="center" justifyContent="center">
					<Typography>This user does not have any posts yet</Typography>
				</Box>
			)}
		</>
	)
}
