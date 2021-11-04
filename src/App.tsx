import { LocalizationProvider } from "@mui/lab"
import AdapterDateFns from "@mui/lab/AdapterDateFns"
import { SignWrapper } from "./views/Sign"
import {
	BrowserRouter as Router,
	Switch,
	Route,
	useLocation,
} from "react-router-dom"
import { Home } from "./views/Home"
import { AppBarComponent } from "./components/AppBar"
import { SearchPage } from "./views/SearchPage"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "./hooks"
import { CommentType, PostType, UserType } from "./types"
import { setPost } from "./slices/postsSlice"
import { setComment } from "./slices/commentsSlice"
import { addUser } from "./slices/usersSlice"
import { addUserUid } from "./slices/userListSlice"
import { UserPage } from "./views/UserPage"
import { UserSettings } from "./views/UserSettings"
import {
	getFirestore,
	getDoc,
	doc,
	collection,
	onSnapshot,
} from "firebase/firestore"
import { firebaseApp } from "./firebase"
import { Chat } from "./views/Chat"
import { Friends } from "./views/FriendsList"
import { Messanger } from "./views/Messanger"
// for testing purposes
import "./testFirbastore"
import { setUser } from "./slices/userSlice"

const db = getFirestore(firebaseApp)

export function App() {
	const dispatch = useAppDispatch()
	const [isAppbarShown, setIsAppbarShown] = useState(false)
	const userList = useAppSelector((s) => s.userList)
	const users = useAppSelector((s) => s.users)
	const currentUser = useAppSelector((s) => s.user.userState as UserType)
	const { pathname } = useLocation()

	// get rid of the appbar when it is not needed
	useEffect(() => {
		if (/messanger\/[0-9a-zA-Z-]+/.test(pathname)) {
			setIsAppbarShown(false)
		} else setIsAppbarShown(true)
	}, [pathname])

	// watch for user
	useEffect(() => {
		const ref = doc(db, `users/${currentUser.uid}`)
		const unsub = onSnapshot(ref, (snap) => {
			dispatch(setUser(snap.data() as UserType))
		})
		return unsub
	}, [currentUser.uid, dispatch])

	useEffect(() => {
		const promises = userList.map(async (uid) => {
			const userFindResult = users.find((v) => v.uid === uid)
			if (userFindResult) return
			const userRef = doc(db, `users/${uid}`)
			const result = await getDoc(userRef)
			return result.data() as UserType
		})

		Promise.all(promises).then((usersArr) => {
			usersArr.forEach((user) => {
				if (!user) return
				dispatch(addUser(user))
			})
		})
	}, [userList, users, dispatch])

	useEffect(() => {
		const unsubList: Array<() => void> = []

		const unsub2 = onSnapshot(collection(db, `posts`), (posts) => {
			posts.docs.forEach((post) => {
				const postData = post.data() as PostType
				if (!users.find((v) => v.uid === postData.authorUid)) {
					dispatch(addUserUid(postData.authorUid))
				}

				dispatch(setPost(postData))
			})
		})

		const unsub3 = onSnapshot(collection(db, `comments`), (comments) => {
			comments.forEach((comment) => {
				dispatch(setComment(comment.data() as CommentType))
			})
		})

		unsubList.push(unsub2, unsub3)

		return () => unsubList.forEach((v) => v())
	}, [dispatch, users])

	return (
		<LocalizationProvider dateAdapter={AdapterDateFns}>
			{isAppbarShown && <AppBarComponent />}
			<Switch>
				<Route
					path="/messanger/:messageRoomId"
					exact
					render={({ match }) => (
						<Chat messangerRoomId={match.params.messageRoomId} />
					)}
				/>
				<Route path="/messanger">
					<Messanger />
				</Route>
				<Route path="/friends">
					<Friends />
				</Route>
				<Route
					path="/user/:id"
					render={({ match }) => <UserPage uid={match.params.id} />}
				/>
				<Route path="/user">
					<UserPage isCurrentUser uid={currentUser.uid} />
				</Route>
				<Route path="/usersettings">
					<UserSettings />
				</Route>
				<Route path="/signup">
					<SignWrapper isSignIn={false} />
				</Route>
				<Route path="/signin">
					<SignWrapper isSignIn={true} />
				</Route>
				<Route path="/searchpage">
					<SearchPage />
				</Route>
				<Route path="/">
					<Home />
				</Route>
			</Switch>
		</LocalizationProvider>
	)
}
