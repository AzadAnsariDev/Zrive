import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/state/authSlice'
import productReducer from '../features/product/state/productSlice'
import cartReducer from "../features/cart/state/cartSlice"
import addressReducer from "../features/address/state/addressSlice"
import orderReducer from "../features/order/state/orderSlice"
import sellerReducer from "../features/seller/state/sellerSlice"
import adminReducer from "../features/admin/state/adminSlice"
import deliveryReducer from "../features/delivery/state/deliverySlice"
import wishlistReducer from "../features/wishlist/state/wishlistSlice"
import reviewReducer from "../features/review/state/reviewSlice"
import notificationReducer from "../features/seller/state/notificationSlice"
import inAppNotificationReducer from '../features/notification/state/notificationSlice'
export const store = configureStore({
    reducer :{
        auth : authReducer,
        product: productReducer,
        cart : cartReducer,
        address: addressReducer,
        order: orderReducer,
        seller: sellerReducer,
        admin: adminReducer,
        delivery: deliveryReducer,
        wishlist: wishlistReducer,
        review: reviewReducer,
    notification: notificationReducer,
    inAppNotification: inAppNotificationReducer
    }
})

