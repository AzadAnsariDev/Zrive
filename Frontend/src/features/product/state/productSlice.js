import { createSlice } from '@reduxjs/toolkit'

const productSlice = createSlice({
    name: "product",
    initialState: {
        sellerProducts: [],
        products: [],
        searchResults: [],
        loading: {
            fetch: false,
            create: false,
            search: false
        }
    },
    reducers: {
        setSellerProducts: (state, action) => {
            state.sellerProducts = action.payload
        },
        setProducts: (state, action) => {
            state.products = action.payload
        },
        setFetchLoading: (state, action) => {
            state.loading.fetch = action.payload
        },
        setCreateLoading: (state, action) => {
            state.loading.create = action.payload
        },
        setSearchResults: (state, action) => {
            state.searchResults = action.payload
        },
        setSearchLoading: (state, action) => {
            state.loading.search = action.payload
        },
        clearSearchResults: (state) => {
            state.searchResults = []
        }
    }
})

export const {
    setSellerProducts,
    setProducts,
    setCreateLoading,
    setFetchLoading,
    setSearchResults,
    setSearchLoading,
    clearSearchResults
} = productSlice.actions

export default productSlice.reducer