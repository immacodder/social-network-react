import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const userListSlice = createSlice({
	name: 'userList',
	initialState: [] as string[],
	reducers: {
		addUserUid(state, { payload }: PayloadAction<string>) {
			state.push(payload)
		},
		removeUserUid(state, { payload }: PayloadAction<string>) {
			return state.filter((v) => v !== payload)
		},
	},
})

export const { addUserUid, removeUserUid } = userListSlice.actions
