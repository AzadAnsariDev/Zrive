import axios from 'axios'

const productApiInstance = axios.create({
    baseURL: "/api/product",
    withCredentials: true
})

export const createProduct = async (formData)=>{
    const response = await productApiInstance.post("/createProduct", formData)

    return response.data
}

