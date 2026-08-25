import { createSlice } from "@reduxjs/toolkit";

const orderSlice = createSlice({
  name: "order",
  initialState: {
    orders: [],
    currentOrder: null,
    loading: false,
    error: null,
  },
  reducers: {
    setOrders: (state, action) => {
      state.orders = action.payload;
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
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
    updateOrder: (state, action) => {
      const updatedOrder = action.payload;

      if (state.currentOrder?._id === updatedOrder._id) {
        state.currentOrder = updatedOrder;
      }

      state.orders = state.orders.map((order) =>
        order._id === updatedOrder._id ? updatedOrder : order,
      );
    },
  },
});

export const {
  setError,
  setCurrentOrder,
  setLoading,
  setOrders,
  clearCurrentOrder,
  clearOrders,
  updateOrder
} = orderSlice.actions;

export default orderSlice.reducer;
