import { CssBaseline } from '@material-ui/core'
import ReactDOM from 'react-dom'
import { App } from './App'
import fire from 'firebase/app'
import 'firebase/auth'
import 'firebase/storage'
import 'firebase/firestore'
import { Provider } from 'react-redux'
import { store } from './store'
import React from 'react'

if (!fire.apps.length) {
  fire.initializeApp({
    apiKey: 'AIzaSyAmffOO8mDYpcr6ZkemMmnc44WFVf43YVI',
    authDomain: 'social-network-17737.firebaseapp.com',
    projectId: 'social-network-17737',
    storageBucket: 'social-network-17737.appspot.com',
    messagingSenderId: '707141568088',
    appId: '1:707141568088:web:ba014a830411e1f8cb6c2d',
  })
} else fire.app() // if already initialized, use that one

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.firebase = fire

export { fire }

ReactDOM.render(
  <Provider store={store}>
    <CssBaseline>
      <App />
    </CssBaseline>
  </Provider>,
  document.querySelector('#root'),
)
