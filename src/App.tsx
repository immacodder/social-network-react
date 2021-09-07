/* eslint-disable no-debugger */
import { LocalizationProvider } from '@material-ui/lab'
import AdapterDateFns from '@material-ui/lab/AdapterDateFns'
import { SignWrapper } from './views/Sign'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { Home } from './views/Home'
import { AppBarComponent } from './components/AppBar'
import { SearchPage } from './views/SearchPage'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './hooks'
import { CommentType, PostType, UserType } from './types'
import { setPost } from './slices/postsSlice'
import { setComment } from './slices/commentsSlice'
import { addUser } from './slices/usersSlice'
import { addUserUid } from './slices/userListSlice'
import { UserPage } from './views/UserPage'
import { UserSettings } from './views/UserSettings'
import {
	getFirestore,
	getDoc,
	doc,
	collection,
	onSnapshot,
} from 'firebase/firestore'
import { firebaseApp } from './firebase'

const db = getFirestore(firebaseApp)

export function App() {
	const dispatch = useAppDispatch()
	const userList = useAppSelector((s) => s.userList)
	const users = useAppSelector((s) => s.users)
	const user = useAppSelector((s) => s.user.userState as UserType)

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
			<Router>
				<AppBarComponent />
				<Switch>
					<Route
						path="/user/:id"
						render={({ match }) => <UserPage uid={match.params.id} />}
					/>
					<Route path="/user">
						<UserPage uid={user.uid} />
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
			</Router>
		</LocalizationProvider>
	)
}
