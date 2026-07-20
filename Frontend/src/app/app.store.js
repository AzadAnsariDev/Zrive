import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/state/authSlice'
import productReducer from '../features/product/state/productSlice'

export const store = configureStore({
    reducer :{
        auth : authReducer,
        product: productReducer
    }
})

