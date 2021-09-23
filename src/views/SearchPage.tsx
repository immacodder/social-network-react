import {
	Container,
	FormControl,
	MenuItem,
	Select,
	Stack,
	TextField,
} from '@material-ui/core'
import { InputLabel } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { MeiliSearch } from 'meilisearch'
import { PostType, UserType } from '../types'
import { Post } from '../components/Post'
import { UserCard } from '../components/UserCard'

const client = new MeiliSearch({
	host: 'http://localhost:7700',
})
// @ts-ignore
window.client = client

type filterStrings = 'posts' | 'users'

export function SearchPage() {
	const [term, setTerm] = useState('')
	const [posts, setPosts] = useState<PostType[]>([])
	const [users, setUsers] = useState<UserType[]>([])
	const [searchFilter, setSearchFilter] = useState<filterStrings>('users')

	useEffect(() => {
		const callMe = async function () {
			const results = (await client.index(searchFilter).search(term))
				.hits as unknown[]
			if (searchFilter === 'posts') {
				setPosts(results as PostType[])
			} else if (searchFilter === 'users') {
				setUsers(results as UserType[])
			}
		}
		callMe()
	}, [term, searchFilter])

	let results: JSX.Element[] = []

	if (searchFilter === 'posts')
		results = posts.map((post) => <Post key={post.uid} {...post} />)
	else if (searchFilter === 'users')
		results = users.map((user) => <UserCard key={user.uid} {...user} />)

	return (
		<>
			<Container>
				<Stack rowGap={2}>
					<TextField
						label="Search for anything"
						fullWidth
						InputProps={{ fullWidth: true }}
						autoFocus
						value={term}
						onChange={(e) => setTerm(e.target.value)}
					/>
					<FormControl>
						<InputLabel id="select-label">Search for anything:</InputLabel>
						<Select
							labelId="select-label"
							id="select"
							label="Search for anything:"
							value={searchFilter}
							onChange={(e) => setSearchFilter(e.target.value as filterStrings)}
						>
							<MenuItem value="posts">Search for Posts</MenuItem>
							<MenuItem value="users">Search for Users</MenuItem>
						</Select>
					</FormControl>
					{results}
				</Stack>
			</Container>
		</>
	)
}
