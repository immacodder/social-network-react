import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AlertUnion, AlertWithDescription } from "../types"

const initialState = {
	type: "withDescription",
	shown: true,
	title: "someTitle",
	description: "Hello there",
	severity: "success",
} as AlertUnion

export const alertSlice = createSlice({
	initialState,
	name: "alertSlice",
	reducers: {
		setAlert(state, { payload }: PayloadAction<AlertUnion>) {
			return payload
		},
	},
})

export const { setAlert } = alertSlice.actions
