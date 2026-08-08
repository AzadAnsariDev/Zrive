import { createSlice } from "@reduxjs/toolkit";

export const sellerSlice = createSlice({
    name: "seller",
    initialState: {
        allOrders: [],
        application: null,   // current seller's application, or null if not started
        loading: false,
        error: null,
    },
    reducers: {
        setAllOrders: (state, action) => {
            state.allOrders = action.payload
        },
        setApplication: (state, action) => {
            state.application = action.payload
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
    }
})

export const { setAllOrders, setApplication, setLoading, setError } = sellerSlice.actions
export default sellerSlice.reducer