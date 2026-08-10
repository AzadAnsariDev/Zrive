import { createSlice } from '@reduxjs/toolkit'

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    admin: null,
    isAuthenticated: false,
    authChecked: false,
    error: null,
    loading: {
      fetch: false,
      create: false,
    },

    sellers: [],
    selectedSeller: null,
  },
  reducers: {
    setAdmin: (state, action) => {
      state.admin = action.payload
      state.isAuthenticated = !!action.payload
      state.authChecked = true
    },
    clearAdmin: (state) => {
      state.admin = null
      state.isAuthenticated = false
      state.authChecked = true
    },

    setLoading: (state, action) => {
      const { key, value } = action.payload // { key: 'fetch' | 'create', value: boolean }
      state.loading[key] = value
    },
    setError: (state, action) => {
      state.error = action.payload
    },

    setSellers: (state, action) => {
      state.sellers = action.payload
    },
    setSelectedSeller: (state, action) => {
      state.selectedSeller = action.payload
    },
    updateSellerInStore: (state, action) => {
      const updated = action.payload // { _id, applicationStatus, rejectionReason }
      const idx = state.sellers.findIndex((s) => s._id === updated._id)
      if (idx !== -1) state.sellers[idx] = { ...state.sellers[idx], ...updated }
      if (state.selectedSeller?._id === updated._id) {
        state.selectedSeller = { ...state.selectedSeller, ...updated }
      }
    },
  },
})

export const {
  setAdmin, clearAdmin,
  setLoading, setError,
  setSellers, setSelectedSeller, updateSellerInStore,
} = adminSlice.actions
export default adminSlice.reducer