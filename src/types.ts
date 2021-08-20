export interface PostType {
  postUid: string;
  title: string;
  createdAt: number;
  authorUid: string;
  bodyText: string;
  imageUrls: string[];
  likedBy: string[];
  dislikedBy: string[];
  comments: Comment[];
}

export interface CommentType {
  parentPostUid: string;
  authorUid: string;
  commentUid: string;
  bodyText: string;
  likedBy: string[];
  dislikedBy: string[];
}

export interface UserType {
  firstName: string;
  secondName: string;
  uid: string;
  dateOfBirth: number;
  biography: string;
  profileImage: string | null;
}

export type UserState = UserType | "signed out" | "initializing";
