import { Box, CircularProgress } from '@material-ui/core'
import { useEffect } from 'react'
import { useHistory, Switch, Route, Redirect } from 'react-router-dom'
import { fire } from '.'
import { App } from './App'
import { useAppDispatch, useAppSelector } from './hooks'
import { setUser } from './slices/userSlice'
import { UserType } from './types'
import { Sign } from './views/Sign'

export function AuthWrapper() {
	const user = useAppSelector((s) => s.user.userState)
	const { push } = useHistory()
	const dispatch = useAppDispatch()

	useEffect(() => {
		const unsub = fire.auth().onAuthStateChanged(async (u) => {
			if (!u) return dispatch(setUser('signed out'))
			if (typeof user === 'string') {
				const userData = (
					await fire.firestore().doc(`users/${u.uid}`).get()
				).data() as UserType
				dispatch(setUser(userData))
			}
		})
		return unsub
	}, [user, dispatch])

	if (user === 'initializing')
		return (
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100vh',
				}}
			>
				<CircularProgress />
			</Box>
		)
	if (user === 'signed out') {
		push('/signin')
		return (
			<>
				<Switch>
					<Route path="/signin">
						<Sign isSignIn />
					</Route>
					<Route path="/signup">
						<Sign isSignIn={false} />
					</Route>
					<Route path="/">
						<Redirect to="/signin" />
					</Route>
				</Switch>
			</>
		)
	}
	return <App />
}
