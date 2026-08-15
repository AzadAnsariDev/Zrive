import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        loading: true,
        error: null,
        updateLoading: false,
        passwordLoading: false
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
        setUpdateLoading: (state, action) => {
            state.updateLoading = action.payload
        },
        setPasswordLoading: (state, action) => {
            state.passwordLoading = action.payload
        }
    }
})

export const {
    setUser,
    setLoading,
    setError,
    setUpdateLoading,
    setPasswordLoading
} = authSlice.actions

export default authSlice.reducer