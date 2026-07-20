import axios from 'axios'

const productApiInstance = axios.create({
    baseURL: "/api/product",
    withCredentials: true
})

export const createProduct = async (formData)=>{
    const response = await productApiInstance.post("/createProduct", formData)
    return response.data
}

export const getProductList = async ()=>{
    const response = await productApiInstance.get("/getSellerProducts")
    return response.data
} 