import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { HeaderStateType } from "../types"

const initialState: HeaderStateType = { isOpened: true }
const slice = createSlice({
	name: "header",
	initialState,
	reducers: {
		setHeaderOpened(state, { payload: isOpened }: PayloadAction<boolean>) {
			state.isOpened = isOpened
		},
	},
})

export const HeaderSliceReducer = slice.reducer
export const { setHeaderOpened } = slice.actions
