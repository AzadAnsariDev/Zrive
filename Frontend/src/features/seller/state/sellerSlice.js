import { createSlice } from "@reduxjs/toolkit";

export const sellerSlice = createSlice({
    name: "seller",
    initialState: {
        allOrders: [],
        orders: [],          // alias for allOrders for backward compatibility
        currentOrder: null,  // currently viewed order details in SellerOrderDetail
        application: null,   // current seller's application, or null if not started
        loading: false,
        error: null,
    },
    reducers: {
        setAllOrders: (state, action) => {
            state.allOrders = action.payload || []
            state.orders = action.payload || []
        },
        setCurrentOrder: (state, action) => {
            state.currentOrder = action.payload
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

export const { setAllOrders, setCurrentOrder, setApplication, setLoading, setError } = sellerSlice.actions
export default sellerSlice.reducer