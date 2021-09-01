import { useEffect, useState } from 'react'
import { fire } from '..'
import { UserType } from '../types'

export function useUserById(uid: string) {
	const [user, setUser] = useState<UserType | null>(null)

	useEffect(() => {
		fire
			.firestore()
			.doc(`users/${uid}`)
			.get()
			.then((res) => setUser(res.data() as UserType))
	}, [uid])

	return user
}
