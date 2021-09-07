import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

const firebaseConfig = {
	apiKey: 'AIzaSyAmffOO8mDYpcr6ZkemMmnc44WFVf43YVI',
	authDomain: 'social-network-17737.firebaseapp.com',
	projectId: 'social-network-17737',
	storageBucket: 'social-network-17737.appspot.com',
	messagingSenderId: '707141568088',
	appId: '1:707141568088:web:ba014a830411e1f8cb6c2d',
}

export const firebaseApp = initializeApp(firebaseConfig)

const auth = getAuth(firebaseApp)
connectAuthEmulator(auth, 'http://localhost:9099')

const db = getFirestore(firebaseApp)
connectFirestoreEmulator(db, 'localhost', 8080)

const storage = getStorage(firebaseApp)
connectStorageEmulator(storage, 'localhost', 9199)
