import {
	AppBar,
	Link,
	IconButton,
	Menu,
	Toolbar,
	Stack,
	Avatar,
	MenuItem,
	ListItemIcon,
	Icon,
	Badge,
	ListItemText,
	Typography,
	Tooltip,
} from "@mui/material"
import { Link as RouterLink, useHistory } from "react-router-dom"
import { useEffect, useRef, useState, ReactElement } from "react"
import { useAppSelector } from "../hooks"
import {
	FriendRequest,
	FriendRequestAccepted,
	FriendRequestRejected,
	UserType,
	notification,
} from "../types"
import { firebaseApp } from "../firebase"
import { getAuth, signOut } from "firebase/auth"
import { green, red } from "@mui/material/colors"
import {
	arrayUnion,
	collection,
	deleteDoc,
	doc,
	getFirestore,
	onSnapshot,
	query,
	setDoc,
	updateDoc,
	where,
} from "@firebase/firestore"
import { UserAvatarFetch } from "./UserAvatar"
import { v4 } from "uuid"

const auth = getAuth(firebaseApp)
const db = getFirestore(firebaseApp)

export function AppBarComponent() {
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
	const { push } = useHistory()
	const userAvatarRef = useRef<HTMLDivElement>(null)
	const currentUser = useAppSelector((s) => s.user.userState as UserType)
	const notificationsRef = useRef<any>(null)
	const [areNotificationsOpen, setAreNotificationsOpen] = useState(false)
	const [notifications, setNotifications] = useState<notification[]>([])

	useEffect(() => {
		const ref = query(
			collection(db, "notifications"),
			where("receiver", "==", currentUser.uid)
		)
		const unsub = onSnapshot(ref, (res) => {
			setNotifications(res.docs.map((doc) => doc.data() as FriendRequest))
		})

		return unsub
	}, [currentUser.uid])

	function onSignOutClick() {
		signOut(auth)
	}

	function deleteNotification(uid: string) {
		deleteDoc(doc(db, `notifications/${uid}`))
	}

	async function onFriendAcceptOrReject(args: {
		accept: boolean
		senderUid: string
		notificationId: string
	}) {
		const notification: FriendRequestAccepted | FriendRequestRejected = {
			type: args.accept ? "friendRequestAccepted" : "friendRequestRejected",
			uid: v4(),
			receiver: args.senderUid,
			sender: currentUser,
		}

		if (!args.accept) {
			finish()
			return
		}

		await updateDoc(doc(db, `users/${currentUser.uid}`), {
			friendList: arrayUnion(args.senderUid),
		})
		await updateDoc(doc(db, `users/${args.senderUid}`), {
			friendList: arrayUnion(currentUser.uid),
		})

		finish()

		async function finish() {
			await setDoc(doc(db, `notifications/${notification.uid}`), notification)
			deleteNotification(args.notificationId)
		}
	}

	return (
		<>
			<AppBar position="static" sx={{ mb: 2 }}>
				<Toolbar
					sx={{
						justifyContent: "space-between",
					}}
				>
					<Link
						sx={{ color: "white" }}
						fontWeight="bold"
						underline="none"
						variant="h5"
						component={RouterLink}
						to="/"
					>
						Socify
					</Link>

					<Stack direction="row" gap={2}>
						<IconButton onClick={() => push("/searchpage")}>
							<Icon sx={{ color: "white" }}>search</Icon>
						</IconButton>
						<IconButton
							ref={notificationsRef}
							onClick={() => setAreNotificationsOpen(!areNotificationsOpen)}
						>
							<Badge
								badgeContent={notifications.length}
								invisible={!notifications.length}
								color="secondary"
							>
								<Icon sx={{ color: "white" }}>notifications</Icon>
							</Badge>
						</IconButton>
						<Menu
							anchorEl={notificationsRef.current!}
							open={areNotificationsOpen}
							onClose={() => setAreNotificationsOpen(false)}
						>
							{notifications.length === 0 && (
								<MenuItem>Well, that is pretty empty</MenuItem>
							)}
							{notifications.map((r) => {
								if (r.type === "friendRequest") {
									let term: ReactElement | string = ""
									term = `${r.sender.firstName} wants to be friends with you`
									return (
										<MenuItem
											key={r.sender.uid}
											disableRipple
											sx={{ cursor: "default" }}
										>
											<ListItemIcon sx={{ mr: 1 }}>
												<UserAvatarFetch redirect uid={r.sender.uid} />
											</ListItemIcon>
											<ListItemText>{term}</ListItemText>
											<Stack sx={{ ml: "4px" }} direction="row">
												<Tooltip title="accept">
													<IconButton
														onClick={() =>
															onFriendAcceptOrReject({
																accept: true,
																senderUid: r.sender.uid,
																notificationId: r.uid,
															})
														}
														color="primary"
													>
														<Icon>check</Icon>
													</IconButton>
												</Tooltip>
												<Tooltip title="reject">
													<IconButton
														onClick={() =>
															onFriendAcceptOrReject({
																accept: false,
																notificationId: r.uid,
																senderUid: r.sender.uid,
															})
														}
														color="error"
													>
														<Icon>close</Icon>
													</IconButton>
												</Tooltip>
											</Stack>
										</MenuItem>
									)
								}

								let term
								if (r.type === "friendRequestAccepted")
									term = (
										<>
											{r.sender.firstName}
											<Typography component="span" color={green[500]}>
												{" accepted "}
											</Typography>
											your friend request
										</>
									)
								else if (r.type === "friendRequestRejected")
									term = (
										<>
											{r.sender.firstName}
											<Typography component="span" color={red[500]}>
												{" rejected "}
											</Typography>
											your friend request
										</>
									)
								else if (r.type === "unfriendRequest")
									term = `${r.sender.firstName} is no longer your friend :(`

								return (
									<MenuItem
										key={r.sender.uid}
										disableRipple
										sx={{ cursor: "default" }}
									>
										<ListItemIcon sx={{ mr: 1 }}>
											<Avatar></Avatar>
										</ListItemIcon>
										<ListItemText>{term}</ListItemText>
										<Tooltip title="Close notification">
											<IconButton
												onClick={() => deleteNotification(r.uid)}
												color="error"
											>
												<Icon>close</Icon>
											</IconButton>
										</Tooltip>
									</MenuItem>
								)
							})}
						</Menu>
						<Avatar
							className="button"
							src={currentUser.profileImage ?? undefined}
							onClick={() => setIsUserMenuOpen(true)}
							ref={userAvatarRef}
						>
							{`${currentUser.firstName[0]}${currentUser.secondName[0]}`}
						</Avatar>
						<Menu
							anchorEl={userAvatarRef.current!}
							open={isUserMenuOpen}
							onClose={() => setIsUserMenuOpen(false)}
						>
							<MenuItem onClick={() => setIsUserMenuOpen(false)}>
								<ListItemIcon>
									<Icon>account_box</Icon>
								</ListItemIcon>
								<Link
									sx={{ textDecoration: "none", color: "text.primary" }}
									component={RouterLink}
									to="/user"
								>
									Profile
								</Link>
							</MenuItem>
							<MenuItem onClick={() => setIsUserMenuOpen(false)}>
								<ListItemIcon>
									<Icon>people</Icon>
								</ListItemIcon>
								<Link
									sx={{ textDecoration: "none", color: "text.primary" }}
									component={RouterLink}
									to="/friends"
								>
									Friends
								</Link>
							</MenuItem>
							<MenuItem onClick={() => setIsUserMenuOpen(false)}>
								<ListItemIcon>
									<Icon>groups</Icon>
								</ListItemIcon>
								<Link
									sx={{ textDecoration: "none", color: "text.primary" }}
									component={RouterLink}
									to="/groups"
								>
									Groups
								</Link>
							</MenuItem>
							<MenuItem onClick={() => setIsUserMenuOpen(false)} divider>
								<ListItemIcon>
									<Icon>chat</Icon>
								</ListItemIcon>
								<Link
									sx={{ textDecoration: "none", color: "text.primary" }}
									component={RouterLink}
									to="/messanger"
								>
									Messanger
								</Link>
							</MenuItem>
							<MenuItem onClick={() => setIsUserMenuOpen(false)} divider>
								<ListItemIcon>
									<Icon>settings</Icon>
								</ListItemIcon>
								<Link
									sx={{ textDecoration: "none", color: "text.primary" }}
									component={RouterLink}
									to="/usersettings"
								>
									Settings
								</Link>
							</MenuItem>
							<MenuItem
								sx={{ color: "error.main" }}
								onClick={() => {
									setIsUserMenuOpen(false)
									onSignOutClick()
								}}
							>
								<ListItemIcon>
									<Icon color="error">logout</Icon>
								</ListItemIcon>
								Log out
							</MenuItem>
						</Menu>
					</Stack>
				</Toolbar>
			</AppBar>
		</>
	)
}
