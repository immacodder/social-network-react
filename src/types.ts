export interface PostType {
	title: string
	uid: string
	createdAt: number
	authorUid: string
	bodyText: string
	imageUrls: string[]
	likedBy: string[]
	dislikedBy: string[]
}

export interface CommentType {
	parentPostUid: string
	authorUid: string
	uid: string
	bodyText: string
	likedBy: string[]
	dislikedBy: string[]
	createdAt: number
}

export interface UserType {
	firstName: string
	secondName: string
	dateOfBirth: number
	biography: string
	uid: string
	profileImage: string | null
	friendList: string[]
}

interface Notification {
	sender: UserType
	receiver: string
	uid: string
}

export interface FriendRequest extends Notification {
	type: "friendRequest"
}

export interface UnfriendRequest extends Notification {
	type: "unfriendRequest"
}

export interface FriendRequestAccepted extends Notification {
	type: "friendRequestAccepted"
}

export interface FriendRequestRejected extends Notification {
	type: "friendRequestRejected"
}

export type notification =
	| FriendRequest
	| FriendRequestAccepted
	| FriendRequestRejected
	| UnfriendRequest

export type UserState = UserType | "signed out" | "initializing"

export interface MessageType {
	roomId: string
	createdBy: string
	uid: string
	imageUrls: string[]
	text: string
	createdAt: number
	repliedTo?: string
	isRead: boolean
}

interface MessageRoom {
	uid: string
	createdAt: number
	messages: MessageType[]
	// I have to do this, because firestore doesn't support
	// multiple array contains-operations
	members: { [key: string]: true }
}

export interface GroupMessageRoom extends MessageRoom {
	type: "group"
	title: string
	owner: string
	photoUrl?: string
	description?: string
}

export interface DialogMessageRoom extends MessageRoom {
	type: "dialog"
}

export interface HeaderStateType {
	isOpened: boolean
}

export type chat = GroupMessageRoom | DialogMessageRoom
