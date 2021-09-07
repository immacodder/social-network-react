import * as functions from 'firebase-functions'
import { MeiliSearch } from 'meilisearch'

const client = new MeiliSearch({ host: 'http://localhost:7700' })

// posts
export const updloadPostToMeili = functions.firestore
	.document('posts/{postId}')
	.onCreate((snap) => {
		client.index('posts').addDocuments([snap.data()])
		return 0
	})

export const updatePostOnMeili = functions.firestore
	.document('posts/{postId}')
	.onUpdate((snap) => {
		client.index('posts').updateDocuments([snap.after.data()])
		return 0
	})

export const deletePostOnMeili = functions.firestore
	.document('posts/{postId}')
	.onDelete((snap) => {
		client.index('posts').deleteDocument(snap.id)
		return 0
	})

// users
export const uploadUserToMeili = functions.firestore
	.document('users/{userId}')
	.onCreate((snap) => {
		client.index('users').addDocuments([snap.data()])
		return 0
	})

export const updateUserOnMeili = functions.firestore
	.document('users/{userId}')
	.onUpdate((snap) => {
		client.index('users').updateDocuments([snap.after.data()])
		return 0
	})

export const deleteUserOnMeili = functions.firestore
	.document('users/{userId}')
	.onDelete((snap) => {
		client.index('users').deleteDocument(snap.id)
		return 0
	})
