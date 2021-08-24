import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CommentType } from '../types'

const initialState: CommentType[] = []

export const commentsSlice = createSlice({
  initialState,
  name: 'comments',
  reducers: {
    setComment(state, { payload }: PayloadAction<CommentType>) {
      return state.map((v) =>
        v.uid === payload.uid ? payload : v,
      )
    },
    deleteComment(state, { payload }: PayloadAction<{ uid: string }>) {
      return state.filter((v) => v.uid !== payload.uid)
    },
  },
})

export const { setComment, deleteComment } = commentsSlice.actions
