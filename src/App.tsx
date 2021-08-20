import { LocalizationProvider } from '@material-ui/lab'
import AdapterDateFns from '@material-ui/lab/AdapterDateFns'
import { Sign } from './views/Sign'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { Home } from './views/Home'
import { AppBarComponent } from './components/AppBar'
import { SearchPage } from './views/SearchPage'
import { UserPage } from './views/UserPage'
import { Post } from './components/Post'
import React, { useEffect } from 'react'
import firebase from 'firebase/app'
import { useAppDispatch } from './hooks'
import { setUser } from './slices/userSlice'
import { UserType } from './types'

export function App() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const unsub = firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) return dispatch(setUser('signed out'))

      const { uid } = user
      const userData = (
        await firebase.firestore().doc(`users/${uid}`).get()
      ).data() as UserType

      dispatch(setUser(userData))
    })

    return unsub
  }, [dispatch])

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Router>
        <AppBarComponent />
        <Switch>
          <Route path="/test">
            <Post />
          </Route>
          <Route path="/user">
            <UserPage />
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
