import axios from 'axios'

const reviewApiInstance = axios.create({
    baseURL: "/api/review",
    withCredentials: true
})

export const createReview = async (productId, data) => {
    const response = await reviewApiInstance.post(`/${productId}`, data)
    return response.data
}

export const getProductReviews = async (productId, params) => {
    const response = await reviewApiInstance.get(`/${productId}`, { params })
    return response.data
}

export const checkEligibility = async (productId) => {
    const response = await reviewApiInstance.get(`/${productId}/eligibility`)
    return response.data
}

export const toggleHelpful = async (reviewId) => {
    const response = await reviewApiInstance.patch(`/helpful/${reviewId}`)
    return response.data
}

export const deleteReview = async (reviewId) => {
    const response = await reviewApiInstance.delete(`/${reviewId}`)
    return response.data
}