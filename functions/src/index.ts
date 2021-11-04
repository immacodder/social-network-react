import * as functions from "firebase-functions"
import { MeiliSearch } from "meilisearch"
import * as admin from "firebase-admin"
import { notification, PostType, UserType } from "./types"
import { format } from "date-fns"

const client = new MeiliSearch({ host: "http://localhost:7700" })

admin.initializeApp()

interface UpdatePostType {
	title: string
	bodyText: string
	uid: string
}

interface PostForMeili extends UpdatePostType {
	authorName: string
	createdAt: string
}

// posts
export const updloadPostToMeili = functions.firestore
	.document("posts/{postId}")
	.onCreate(async (snap) => {
		const data = snap.data() as PostType
		const user = (
			await admin.firestore().doc(`users/${data.authorUid}`).get()
		).data() as UserType
		const post: PostForMeili = {
			uid: data.uid,
			title: data.title,
			authorName: `${user.firstName} ${user.secondName}`,
			createdAt: format(data.createdAt, "Yo MMMM Mo eeee", { weekStartsOn: 1 }),
			bodyText: data.bodyText,
		}
		client.index("posts").addDocuments([post])
		return 0
	})

export const updatePostOnMeili = functions.firestore
	.document("posts/{postId}")
	.onUpdate((snap) => {
		const data = snap.after.data() as PostType
		const updatedPost: UpdatePostType = {
			uid: data.uid,
			title: data.title,
			bodyText: data.bodyText,
		}
		client.index("posts").updateDocuments([updatedPost])
		return 0
	})

export const deletePostOnMeili = functions.firestore
	.document("posts/{postId}")
	.onDelete((snap) => {
		client.index("posts").deleteDocument(snap.id)
		return 0
	})

// users
export const uploadUserToMeili = functions.firestore
	.document("users/{userId}")
	.onCreate((snap) => {
		client.index("users").addDocuments([snap.data()])
		return 0
	})

export const updateUserOnMeili = functions.firestore
	.document("users/{userId}")
	.onUpdate((snap) => {
		client.index("users").updateDocuments([snap.after.data()])
		return 0
	})

export const deleteUserOnMeili = functions.firestore
	.document("users/{userId}")
	.onDelete((snap) => {
		client.index("users").deleteDocument(snap.id)
		return 0
	})

export const checkNotificationDuplicate = functions.firestore
	.document("notifications/{notificationId}")
	.onCreate(async (snap, context) => {
		// maybe comment this line out afterwards
		const db = admin.firestore()
		const data = snap.data() as notification
		if (data.type !== "friendRequest") return 0

		const result = (
			await db
				.collection("notifications")
				.where("type", "==", data.type)
				.where("sender", "==", data.sender)
				.where("receiver", "==", data.receiver)
				.get()
		).docs.map((snap) => snap.data() as notification)

		if (result.length && result[0].uid !== data.uid) {
			console.log("Detected a duplicate, deleting...")
			snap.ref.delete()
		}
		return 0
	})
