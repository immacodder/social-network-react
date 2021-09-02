import { Box, CircularProgress } from '@material-ui/core'
import { useEffect } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { fire } from '.'
import { App } from './App'
import { useAppDispatch, useAppSelector } from './hooks'
import { setUser } from './slices/userSlice'
import { UserType } from './types'
import { SignWrapper } from './views/Sign'

export function AuthWrapper() {
	const user = useAppSelector((s) => s.user.userState)
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
	if (user === 'signed out' || !user) {
		return (
			<>
				<Switch>
					<Route path="/signin">
						<SignWrapper isSignIn />
					</Route>
					<Route path="/signup">
						<SignWrapper isSignIn={false} />
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
