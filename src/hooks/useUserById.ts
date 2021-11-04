import { useEffect, useState } from "react"
import { UserType } from "../types"
import { firebaseApp } from "../firebase"
import { getFirestore, doc, getDoc, onSnapshot } from "firebase/firestore"

const db = getFirestore(firebaseApp)

export function useUserById(uid: string) {
	const [user, setUser] = useState<UserType | null>(null)

	useEffect(() => {
		const unsub = onSnapshot(doc(db, `users/${uid}`), (res) => {
			setUser(res.data() as UserType)
		})
		return unsub
	}, [uid])

	return user
}
