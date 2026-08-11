import { createSlice } from "@reduxjs/toolkit";

const deliverySlice = createSlice({
  name: "delivery",
  initialState: {
    currentDelivery: null,
    deliveries: [],
    loading: false,
    error: null,
  },
  reducers: {
    setDeliveryLoading: (state, action) => {
      state.loading = action.payload;
    },
    setDeliveryError: (state, action) => {
      state.error = action.payload;
    },
    setCurrentDelivery: (state, action) => {
      state.currentDelivery = action.payload;
    },
    setDeliveries: (state, action) => {
      state.deliveries = action.payload;
    },
    updateDeliveryInList: (state, action) => {
      const { oldId, updated } = action.payload;
      const index = state.deliveries.findIndex((d) => d._id === oldId);
      if (index !== -1) state.deliveries[index] = updated;
      else state.deliveries.unshift(updated);
    },
  },
});

export const {
  setDeliveryLoading,
  setDeliveryError,
  setCurrentDelivery,
  setDeliveries, 
  updateDeliveryInList,
} = deliverySlice.actions;
export default deliverySlice.reducer;
