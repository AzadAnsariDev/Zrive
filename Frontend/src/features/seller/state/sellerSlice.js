import { createSlice } from "@reduxjs/toolkit";

export const sellerSlice = createSlice({
    name: "seller",
    initialState: {
        allOrders: [],
        loading: false,
        error: null,
    },
    reducers: {
        setAllOrders: (state, action) => {
            state.allOrders = action.payload
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
    }
})

export const { setAllOrders, setLoading, setError } = sellerSlice.actions
export default sellerSlice.reducer