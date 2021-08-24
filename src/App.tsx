/* eslint-disable no-debugger */
import { LocalizationProvider } from '@material-ui/lab'
import AdapterDateFns from '@material-ui/lab/AdapterDateFns'
import { Sign } from './views/Sign'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { Home } from './views/Home'
import { AppBarComponent } from './components/AppBar'
import { SearchPage } from './views/SearchPage'
import { UserPage } from './views/UserPage'
import React, { useEffect } from 'react'
import firebase from 'firebase/app'
import { useAppDispatch, useAppSelector } from './hooks'
import { setUser } from './slices/userSlice'
import { CommentType, PostType, UserType } from './types'
import { setPost } from './slices/postsSlice'
import { setComment } from './slices/commentsSlice'
import { addUser } from './slices/usersSlice'

export function App() {
  const dispatch = useAppDispatch()
  const users = useAppSelector((state) => state.users)

  useEffect(() => {
    const unsubList: Array<() => void> = []
    const unsub1 = firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) return dispatch(setUser('signed out'))

      const { uid } = user
      const userData = (
        await firebase.firestore().doc(`users/${uid}`).get()
      ).data() as UserType

      dispatch(setUser(userData))
    })

    const unsub2 = firebase
      .firestore()
      .collection(`posts`)
      .onSnapshot((posts) => {
        posts.docs.forEach((post) => {
          const data = post.data() as PostType
          firebase
            .firestore()
            .doc(`users/${data.authorUid}`)
            .get()
            .then((v) => {
              if (!v.exists) throw new Error("user doesn't exist")
              dispatch(addUser(v.data() as UserType))
            })

          dispatch(setPost(data))
        })
      })

    const unsub3 = firebase
      .firestore()
      .collection(`comments`)
      .onSnapshot((comments) => {
        comments.forEach(({ data }) => {
          dispatch(setComment(data() as CommentType))
        })
      })

    unsubList.push(unsub1, unsub2, unsub3)

    return () => unsubList.forEach((v) => v())
  }, [dispatch, users])

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Router>
        <AppBarComponent />
        <Switch>
          <Route path="/test">{/* <Post /> */}</Route>
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
