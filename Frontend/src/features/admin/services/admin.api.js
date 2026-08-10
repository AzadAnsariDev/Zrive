import axios from 'axios'

const adminApiInstance = axios.create({
    baseURL: "/api",
    withCredentials: true
})

// ---------------- Auth ----------------
export const adminLogin = async ({ email, password }) => {
    const response = await adminApiInstance.post(`/admin/login`, { email, password })
    return response.data
}

export const adminLogout = async () => {
    const response = await adminApiInstance.post(`/admin/logout`)
    return response.data
}

export const getAdminProfile = async () => {
    const response = await adminApiInstance.get(`/admin/getAdmin`)
    return response.data
}

// ---------------- Seller Applications ----------------
export const getAllSellerApplications = async () => {
    const response = await adminApiInstance.get(`/admin/sellers`)
    return response.data
}

export const getSellerApplicationDetail = async (sellerId) => {
    const response = await adminApiInstance.get(`/admin/sellers/${sellerId}`)
    return response.data
}

export const approveSellerApplication = async (sellerId) => {
    const response = await adminApiInstance.patch(`/admin/sellers/${sellerId}/approve`)
    return response.data
}

export const rejectSellerApplication = async (sellerId, rejectionReason) => {
    const response = await adminApiInstance.patch(`/admin/sellers/${sellerId}/reject`, {
        rejectionReason
    })
    return response.data
}

// ---------------- Deliveries ----------------
export const getFailedDeliveries = async () => {
    const response = await adminApiInstance.get(`/delivery/failed`)
    return response.data
}

export const retryFailedDelivery = async (deliveryId) => {
    const response = await adminApiInstance.post(`/delivery/${deliveryId}/retry`)
    return response.data
}