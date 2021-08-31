import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { UserType } from '../types'

export const usersSlice = createSlice({
	name: 'users',
	initialState: [] as UserType[],
	reducers: {
		addUser(state, { payload }: PayloadAction<UserType>) {
			if (state.find((v) => v.uid === payload.uid)) return state
			state.push(payload)
		},
		clearUsers(state) {
			state = []
		},
	},
})

export const { addUser, clearUsers } = usersSlice.actions
