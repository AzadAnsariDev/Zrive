import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/state/authSlice'
import productReducer from '../features/product/state/productSlice'
import cartReducer from "../features/cart/state/cartSlice"
import addressReducer from "../features/address/state/addressSlice"
import orderReducer from "../features/order/state/orderSlice"
export const store = configureStore({
    reducer :{
        auth : authReducer,
        product: productReducer,
        cart : cartReducer,
        address: addressReducer,
        order: orderReducer
    }
})

