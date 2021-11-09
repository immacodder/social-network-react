import { configureStore } from "@reduxjs/toolkit"
import { userSlice } from "./slices/userSlice"
import { alertSlice } from "./slices/alertSlice"

export const store = configureStore({
	reducer: {
		user: userSlice.reducer,
		alertSlice: alertSlice.reducer,
	},
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
