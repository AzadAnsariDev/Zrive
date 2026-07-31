import { createSlice } from "@reduxjs/toolkit";

const addressSlice = createSlice({
  name: "address",
  initialState: {
    selectedAddress: null,
    addresses: [],
  },

  reducers: {
    setAddresses: (state, action) => {
      state.addresses = action.payload;
    },
    setSelectedAddress: (state, action) => {
      state.selectedAddress = action.payload;
    },
    clearSelectedAddress: (state) => {
      state.selectedAddress = null;
    },
    updateAddressInStore: (state, action) => {
      const updatedAddress = action.payload;
      state.addresses = state.addresses.map((address) => {
        if (address._id === updatedAddress._id) return updatedAddress;
        if (updatedAddress.isDefault) return { ...address, isDefault: false };
        return address;
      });

      if (
        state.selectedAddress &&
        state.selectedAddress._id === updatedAddress._id
      ) {
        state.selectedAddress = updatedAddress;
      }
    },
    addAddress: (state, action) => {
      const newAddress = action.payload;
      if (newAddress.isDefault) {
        state.addresses = state.addresses.map((address) => ({
          ...address,
          isDefault: false,
        }));
      }
      state.addresses.unshift(newAddress);
    },
    deleteAddressInStore: (state, action) => {
      const addressId = action.payload;

      state.addresses = state.addresses.filter(
        (address) => address._id !== addressId,
      );

      if (state.selectedAddress && state.selectedAddress._id === addressId) {
        state.selectedAddress = null;
      }
    },
    clearAddresses: (state) => {
      state.addresses = [];
      state.selectedAddress = null;
    },
  },
});

export const {
  setAddresses,
  addAddress,
  updateAddressInStore,
  deleteAddressInStore,
  setSelectedAddress,
  clearSelectedAddress,
  clearAddresses,
} = addressSlice.actions;

export default addressSlice.reducer;
