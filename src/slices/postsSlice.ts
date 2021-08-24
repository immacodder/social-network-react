import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PostType } from '../types'

const initialState: PostType[] = []

const postSlice = createSlice({
  initialState,
  name: 'posts',
  reducers: {
    setPost(state, { payload: post }: PayloadAction<PostType>) {
      if(state.find(v=>v.uid === post.uid)) return state
      state.push(post)
    },
    removePost(state, { payload: p }: PayloadAction<{ uid: string }>) {
      return state.filter((v) => v.uid !== p.uid)
    },
  },
})

export const postSliceReducer = postSlice.reducer
export const { removePost, setPost } = postSlice.actions
