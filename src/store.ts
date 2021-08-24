import { configureStore } from '@reduxjs/toolkit'
import { postSliceReducer } from './slices/postsSlice'
import { userSlice } from './slices/userSlice'
import { usersSlice } from './slices/usersSlice'

export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    posts: postSliceReducer,
    users: usersSlice.reducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
