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
}

export interface UserType {
  firstName: string
  secondName: string
  dateOfBirth: number
  biography: string
  uid: string
  profileImage: string | null
}

export type UserState = UserType | 'signed out' | 'initializing'
