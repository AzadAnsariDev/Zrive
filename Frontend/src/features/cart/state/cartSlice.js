import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
    name: "cart",
    initialState: {
    items: [],
    totalPrice: 0,
    currency: "INR",
    loading:{
        fetch: false,
        create: false
    },
    },
    reducers : {
        setItems : (state, action)=>{
            state.items = action.payload
        },
        setCartDetails: (state, action) => {
            state.totalPrice = action.payload.totalPrice;
            state.currency = action.payload.currency;
        },
        addItem: (state, action)=>{
            state.items.push(action.payload)
        },
        removeItem: (state, action)=>{
            state.items.splice(action.payload, 1)
        },
        decrementItem : (state, action)=>{
            state.items[action.payload].quantity--; 
        },
        setFetchLoading: (state, action)=>{
            state.loading.fetch =  action.payload
        },
        setCreateLoading: (state, action)=>{
            state.loading.create = action.payload
        }
    }
})

export const {addItem, setCreateLoading, setFetchLoading, setItems, setCartDetails, removeItem, decrementItem} = cartSlice.actions
export default cartSlice.reducer