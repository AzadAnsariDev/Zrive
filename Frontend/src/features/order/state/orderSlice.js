import { createSlice } from '@reduxjs/toolkit'

const orderSlice = createSlice({
    name: "order",
    initialState: {
        orders: [],
        currentOrder: null,
        loading: false,
        error: null
    },
    reducers: {
        setOrders: (state, action) => {
            state.orders = action.payload
        },
        setCurrentOrder: (state, action) => {
            state.currentOrder = action.payload
        },
        clearCurrentOrder: (state) => {
            state.currentOrder = null;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        clearOrders: (state) => {
            state.orders = [];
            state.currentOrder = null;
        },
    }
})

export const { setError, setCurrentOrder, setLoading, setOrders,clearCurrentOrder, clearOrders } = orderSlice.actions

export default orderSlice.reducer
