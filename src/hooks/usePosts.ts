import { useEffect, useState } from 'react'
import { fire } from '..'
import { PostType } from '../types'

export function usePosts(userId: string) {
	const [posts, setPosts] = useState<PostType[]>([])
	useEffect(() => {
		const unsub = fire
			.firestore()
			.collection('posts')
			.where('authorUid', '==', userId)
			.onSnapshot((res) => {
				const tempArr: PostType[] = []
				res.docs.forEach((post) => tempArr.push(post.data() as PostType))
				setPosts(tempArr)
			})
		return unsub
	}, [userId])

	return posts
}
