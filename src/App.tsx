import { LocalizationProvider } from "@mui/lab"
import AdapterDateFns from "@mui/lab/AdapterDateFns"
import { SignWrapper } from "./views/Sign"
import { Switch, Route, useLocation } from "react-router-dom"
import { Home } from "./views/Home"
import { AppBarComponent } from "./components/AppBar"
import { SearchPage } from "./views/SearchPage"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "./hooks"
import { UserType } from "./types"
import { UserPage } from "./views/UserPage"
import { UserSettings } from "./views/UserSettings"
import { getFirestore, doc, onSnapshot } from "firebase/firestore"
import { firebaseApp } from "./firebase"
import { Chat } from "./views/Chat"
import { Friends } from "./views/FriendsList"
import { Messanger } from "./views/Messanger"
// for testing purposes
import "./testFirbastore"
import { setUser } from "./slices/userSlice"
import { GroupPage } from "./views/GroupPage"
import { Groups } from "./views/Groups"

const db = getFirestore(firebaseApp)

export function App() {
	const dispatch = useAppDispatch()
	const [isAppbarShown, setIsAppbarShown] = useState(false)
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

	return (
		<LocalizationProvider dateAdapter={AdapterDateFns}>
			{isAppbarShown && <AppBarComponent />}
			<Switch>
				<Route path="/groups">
					<Groups />
				</Route>
				<Route
					path="/group/:id"
					render={({ match }) => <GroupPage groupId={match.params.id} />}
				/>
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
