import { useEffect, useState } from 'react'
import { PostType } from '../types'
import { firebaseApp } from '../firebase'
import {
	query,
	collection,
	where,
	onSnapshot,
	getFirestore,
} from 'firebase/firestore'

const db = getFirestore(firebaseApp)

export function usePosts(userId: string) {
	const [posts, setPosts] = useState<PostType[]>([])
	useEffect(() => {
		const q = query(collection(db, 'posts'), where('authorUid', '==', userId))
		const unsub = onSnapshot(q, (res) => {
			const tempArr: PostType[] = []
			res.docs.forEach((post) => tempArr.push(post.data() as PostType))
			setPosts(tempArr)
		})
		return unsub
	}, [userId])

	return posts
}
