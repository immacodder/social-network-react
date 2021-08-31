import { configureStore } from '@reduxjs/toolkit'
import { commentsSlice } from './slices/commentsSlice'
import { postSliceReducer } from './slices/postsSlice'
import { userListSlice } from './slices/userListSlice'
import { userSlice } from './slices/userSlice'
import { usersSlice } from './slices/usersSlice'

export const store = configureStore({
	reducer: {
		user: userSlice.reducer,
		posts: postSliceReducer,
		users: usersSlice.reducer,
		comments: commentsSlice.reducer,
		userList: userListSlice.reducer,
	},
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
