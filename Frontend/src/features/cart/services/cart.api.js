import axios from "axios";

const cartApiInstance = axios.create({
    baseURL : "/api/cart",
    withCredentials: true
})

export const addToCart = async (productId, variantId) =>{
    const response = await cartApiInstance.post(`/add/${productId}/${variantId}`,{
        quantity : 1
    })
    return response.data
}
export const removeCartItem = async (productId, variantId, action) =>{
    const response = await cartApiInstance.delete(`/remove/${productId}/${variantId}`,{
        data: { action } 
    })
    return response.data
}

export const getCart = async ()=>{
    const response = await cartApiInstance.get("/getCart")
    return response.data
}
