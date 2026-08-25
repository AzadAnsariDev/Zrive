import axios from 'axios'

const deliveryApiInstance = axios.create({
    baseURL: "/api/delivery",
    withCredentials: true,
})

export const getAllDeliveries = async () => {
    const response = await deliveryApiInstance.get(`/all`)
    return response.data
}

export const getDeliveryByOrder = async (orderId) => {
    const response = await deliveryApiInstance.get(`/by-order/${orderId}`)
    return response.data
}

export const retryDelivery = async (deliveryId) => {
    const response = await deliveryApiInstance.post(`/${deliveryId}/retry`)
    return response.data
}


export const schedulePickup = async (deliveryId) => {
    const response = await deliveryApiInstance.post(`/${deliveryId}/schedule-pickup`)
    return response.data
}

export const generateLabel = async (deliveryId) => {
    const response = await deliveryApiInstance.post(`/${deliveryId}/generate-label`)
    return response.data
}

export const trackDelivery = async (deliveryId) => {
    const response = await deliveryApiInstance.get(`/${deliveryId}/track`)
    return response.data
}

export const assignAWB = async (deliveryId) => {
    const response = await deliveryApiInstance.post(`/${deliveryId}/assign-awb`)
    return response.data
}

export const cancelDelivery = async (deliveryId) => {
    const response = await deliveryApiInstance.post(`/${deliveryId}/cancel`)
    return response.data
}

export const getDeliveryByOrderBuyer = async (orderId) => {
    const response = await deliveryApiInstance.get(`/buyer/by-order/${orderId}`)
    return response.data
}

export const trackDeliveryBuyer = async (deliveryId) => {
    const response = await deliveryApiInstance.get(`/buyer/${deliveryId}/track`)
    return response.data
}