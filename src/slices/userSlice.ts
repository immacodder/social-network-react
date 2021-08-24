import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { UserState } from '../types'

const initialState: { userState: UserState } = { userState: 'initializing' }

const userSlice = createSlice({
  initialState,
  name: 'userSlice',
  reducers: {
    setUser(state, payload: PayloadAction<UserState>) {
      state.userState = payload.payload
    },
  },
})

const { setUser } = userSlice.actions

export { userSlice, setUser }
