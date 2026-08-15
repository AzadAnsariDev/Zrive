import axios from "axios";

const wishlistApiInstance = axios.create({
    baseURL: "/api/wishlist",
    withCredentials: true
})

export const addToWishlist = async (productId, variantSku) => {
    const response = await wishlistApiInstance.post("/", { productId, variantSku })
    return response.data
}

export const removeFromWishlist = async (variantSku) => {
    const response = await wishlistApiInstance.delete(`/${variantSku}`)
    return response.data
}

export const getWishlist = async () => {
    const response = await wishlistApiInstance.get("/")
    console.log(response.data)
    return response.data
}