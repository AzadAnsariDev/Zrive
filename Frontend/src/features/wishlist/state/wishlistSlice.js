import { createSlice } from "@reduxjs/toolkit";

const wishlistSlice = createSlice({
    name: "wishlist",
    initialState: {
        items: [],        
        variantSkus: [],  
        loading: {
            fetch: false,
            create: false
        },
        errors: null,
    },
    reducers: {
        setWishlist: (state, action) => {
            state.items = action.payload.items
            state.variantSkus = action.payload.variantSkus
        },

        addVariantSku: (state, action) => {
            if (!state.variantSkus.includes(action.payload)) {
                state.variantSkus.push(action.payload)
            }
        },

        removeVariantSku: (state, action) => {
            state.variantSkus = state.variantSkus.filter(sku => sku !== action.payload)
            state.items = state.items.filter(item => item.variantSku !== action.payload)
        },
        setFetchLoading: (state, action) => {
            state.loading.fetch = action.payload
        },
        setCreateLoading: (state, action) => {
            state.loading.create = action.payload
        },
        setError: (state, action) => {
            state.errors = action.payload
        }
    }
})

export const { setWishlist, addVariantSku, removeVariantSku, setFetchLoading, setCreateLoading, setError } = wishlistSlice.actions
export default wishlistSlice.reducer