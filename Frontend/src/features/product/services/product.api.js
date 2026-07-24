import axios from 'axios'

const productApiInstance = axios.create({
    baseURL: "/api/product",
    withCredentials: true
})

export const createProduct = async (formData)=>{
    const response = await productApiInstance.post("/createProduct", formData)
    return response.data
}

export const getSellerProducts = async ()=>{
    const response = await productApiInstance.get("/getSellerProducts")
    return response.data
} 

export const getProducts = async ()=>{
    const response = await productApiInstance.get("/getProducts")
    return response.data
}

export const getProductDetail = async (productId)=>{
    const response = await productApiInstance.get(`/getProductDetail/${productId}`)
    return response.data
}

export const addNewVariant = async (productId, formData)=>{
    const response = await productApiInstance.post(`/${productId}/addNewVariant`, formData)
    return response.data
}

