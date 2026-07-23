import { createSlice } from '@reduxjs/toolkit'
import { act } from 'react'

const productSlice = createSlice({
    name: "product",
    initialState:{
        sellerProducts: [],
        products:[],
        loading: {
            fetch: false,
            create: false
        }
    },
    reducers:{
        setSellerProducts: (state, action)=>{
            state.sellerProducts = action.payload
        },
        setProducts: (state, action)=>{
            state.products = action.payload
        },
        setFetchLoading: (state,action)=>{
            state.loading.fetch = action.payload
        },
        setCreateLoading: (state, action)=>{
            state.loading.create = action.payload
        }
    }
})

export const { setSellerProducts, setProducts, setCreateLoading, setFetchLoading } = productSlice.actions

export default productSlice.reducer