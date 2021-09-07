import { useEffect, useState } from 'react'
import { UserType } from '../types'
import { firebaseApp } from '../firebase'
import { getFirestore, doc, getDoc } from 'firebase/firestore'

const db = getFirestore(firebaseApp)

export function useUserById(uid: string) {
	const [user, setUser] = useState<UserType | null>(null)

	useEffect(() => {
		getDoc(doc(db, `users/${uid}`)).then((res) =>
			setUser(res.data() as UserType),
		)
	}, [uid])

	return user
}
