/* eslint-disable no-debugger */
import { LocalizationProvider } from '@material-ui/lab'
import AdapterDateFns from '@material-ui/lab/AdapterDateFns'
import { Sign } from './views/Sign'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { Home } from './views/Home'
import { AppBarComponent } from './components/AppBar'
import { SearchPage } from './views/SearchPage'
import { useEffect } from 'react'
import firebase from 'firebase/app'
import { useAppDispatch, useAppSelector } from './hooks'
import { CommentType, PostType, UserType } from './types'
import { setPost } from './slices/postsSlice'
import { setComment } from './slices/commentsSlice'
import { fire } from '.'
import { addUser } from './slices/usersSlice'
import { addUserUid } from './slices/userListSlice'
import { UserPage } from './views/UserPage'
import { UserSettings } from './views/UserSettings'

export function App() {
	const dispatch = useAppDispatch()
	const userList = useAppSelector((s) => s.userList)
	const users = useAppSelector((s) => s.users)
	const user = useAppSelector((s) => s.user.userState as UserType)
	const posts = useAppSelector((s) => s.posts)

	useEffect(() => {
		const promises = userList.map(async (uid) => {
			const userFindResult = users.find((v) => v.uid === uid)
			if (userFindResult) return

			const result = await fire.firestore().doc(`users/${uid}`).get()
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

		const unsub2 = firebase
			.firestore()
			.collection(`posts`)
			.onSnapshot((posts) => {
				posts.docs.forEach((post) => {
					const postData = post.data() as PostType
					if (!users.find((v) => v.uid === postData.authorUid)) {
						dispatch(addUserUid(postData.authorUid))
					}

					dispatch(setPost(postData))
				})
			})

		const unsub3 = firebase
			.firestore()
			.collection(`comments`)
			.onSnapshot((comments) => {
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
					<Route path="/user">
						<UserPage
							userPosts={posts.filter((v) => v.authorUid === user.uid)}
						/>
					</Route>
					<Route path="/usersettings">
						<UserSettings />
					</Route>
					<Route path="/signup">
						<Sign isSignIn={false} />
					</Route>
					<Route path="/signin">
						<Sign isSignIn={true} />
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
