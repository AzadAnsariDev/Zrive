import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        items: []
    },
    laoding:{
        fetch: false,
        create: false
    },
    reducers : {
        setItems : (state, action)=>{
            state.items = action.payload
        },
        addItem: (state, action)=>{
            state.items.push(action.payload)
        },
        setFetchLoading: (state, action)=>{
            state.loading.fetch = action.payload
        },
        setCreateLoading: (state, action)=>{
            state.loading.create = action.payload
        }
    }
})

export const {addItem, setCreateLoading, setFetchLoading, setItems} = cartSlice.actions
export default cartSlice.reducer