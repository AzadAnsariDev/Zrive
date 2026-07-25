import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/state/authSlice'
import productReducer from '../features/product/state/productSlice'
import cartReducer from "../features/cart/state/cartSlice"

export const store = configureStore({
    reducer :{
        auth : authReducer,
        product: productReducer,
        cart : cartReducer
    }
})

