import { Container, TextField } from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import { MeiliSearch } from 'meilisearch'
import { PostType } from '../types'
import { Post } from '../components/Post'

const client = new MeiliSearch({
	host: 'http://localhost:7700',
})
// @ts-ignore
window.client = client

export function SearchPage() {
	const [term, setTerm] = useState('')
	const [posts, setPosts] = useState<PostType[]>([])

	useEffect(() => {
		const callMe = async function () {
			const results = (await client.index('posts').search(term))
				.hits as PostType[]
			setPosts(results)
		}
		callMe()
	}, [term])

	return (
		<>
			<Container>
				<TextField
					label="Search for anything"
					fullWidth
					InputProps={{ fullWidth: true }}
					autoFocus
					value={term}
					onChange={(e) => setTerm(e.target.value)}
				/>
			</Container>
			{posts.map((post) => (
				<Post key={post.uid} {...post} />
			))}
		</>
	)
}
