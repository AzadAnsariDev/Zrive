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